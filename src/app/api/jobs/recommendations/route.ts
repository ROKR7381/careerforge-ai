/**
 * POST /api/jobs/recommendations
 *
 * Returns a ranked list of jobs for the authenticated user, sourced from
 * Adzuna and match-scored against the user's latest saved resume.
 *
 * Request body (all optional):
 *   { where?: string, q?: string, fullTime?: boolean }
 *   If provided, these override the resume-derived defaults.
 *
 * Response: RecommendationsResponse (see lib/job-aggregator/types.ts).
 *
 * Caching:
 *   Per-user, 24h TTL. Keyed by sha256(userId + canonical query string).
 *   Cache invalidation: POST /api/jobs/refresh.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumeToQuery } from "@/lib/job-aggregator/query-builder";
import { resumeToText } from "@/lib/job-aggregator/resume-text";
import { search, AdzunaError } from "@/lib/job-aggregator/adzuna";
import { scoreMatch } from "@/lib/job-aggregator/match-scorer";
import { cache, buildCacheKey, sha256 } from "@/lib/job-aggregator/cache";
import type {
  Job,
  JobSearchParams,
  QuerySummary,
  RecommendationsResponse,
  ScoredJob,
} from "@/lib/job-aggregator/types";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const SOURCE_PRIORITY: Record<string, number> = {
  naukri: 5,
  linkedin: 4,
  indeed: 3,
  foundit: 2,
  hirist: 2,
  glassdoor: 1,
  monster: 1,
  adzuna: 0,
  other: 0,
};

/** Limit match-score concurrency so we don't blow memory or hammer the backend. */
const SCORE_CONCURRENCY = 5;

interface OverrideBody {
  where?: string;
  q?: string;
  fullTime?: boolean;
}

/** Score a batch of jobs with bounded concurrency. */
async function scoreAll(
  jobs: Job[],
  resumeSummary: string,
): Promise<{ scored: ScoredJob[]; failures: number }> {
  const scored: (ScoredJob | null)[] = new Array(jobs.length).fill(null);
  let failures = 0;

  // Simple sliding-window concurrency limiter.
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < jobs.length) {
      const idx = cursor++;
      const job = jobs[idx];
      const result = await scoreMatch({
        resumeSummary,
        jobDescription: job.description,
      });
      if (!result) {
        failures++;
        scored[idx] = {
          ...job,
          matchScore: 0,
          matchedKeywords: [],
          missingKeywords: [],
          scoreUnavailable: true,
        };
        continue;
      }
      scored[idx] = {
        ...job,
        matchScore: clampScore(result.overall_score),
        matchedKeywords: result.keyword_matches || [],
        missingKeywords: result.missing_keywords || [],
        scoreUnavailable: false,
      };
    }
  }

  await Promise.all(Array.from({ length: SCORE_CONCURRENCY }, () => worker()));
  return { scored: scored.filter(Boolean) as ScoredJob[], failures };
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Dedupe by (title, company, location) hash, keep highest source-priority. */
function dedupeByFingerprint(jobs: ScoredJob[]): ScoredJob[] {
  const byKey = new Map<string, ScoredJob>();
  for (const job of jobs) {
    const key = fingerprint(job);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, job);
      continue;
    }
    const a = SOURCE_PRIORITY[job.source] ?? 0;
    const b = SOURCE_PRIORITY[existing.source] ?? 0;
    // Tie-break: higher match score wins.
    if (a > b || (a === b && job.matchScore > existing.matchScore)) {
      byKey.set(key, job);
    }
  }
  return Array.from(byKey.values());
}

function fingerprint(j: { title: string; company: string; location: string }): string {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  return `${norm(j.title)}|${norm(j.company)}|${norm(j.location)}`;
}

/** Canonicalise a query for cache-key stability. */
function canonicalQuery(params: JobSearchParams, summary: QuerySummary): string {
  return JSON.stringify({
    q: params.q,
    where: params.where,
    fullTime: params.fullTime,
    maxDaysOld: params.maxDaysOld,
    // Summary role/where/skills are also part of the effective query for UI purposes
    role: summary.role,
    skills: summary.skills,
  });
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    // Parse optional overrides from request body
    let overrides: OverrideBody = {};
    try {
      const text = await req.text();
      if (text) overrides = JSON.parse(text) as OverrideBody;
    } catch {
      // empty body is fine; use defaults
    }

    // Load latest resume
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!resume) {
      return NextResponse.json(
        {
          error: "no_resume",
          message: "Upload a resume in /builder to get personalised recommendations.",
        },
        { status: 404 },
      );
    }

    // Resume JSON may be stored as a string (depends on adapter). Handle both.
    const resumeJson: unknown =
      typeof resume.resumeJson === "string"
        ? JSON.parse(resume.resumeJson)
        : resume.resumeJson;

    // Build query (resume -> defaults), then apply user overrides.
    const { params: defaults, summary: defaultSummary } = resumeToQuery(
      resumeJson as any,
    );
    const summary: QuerySummary = {
      role: overrides.q ?? defaultSummary.role,
      skills: defaultSummary.skills,
      where: overrides.where ?? defaultSummary.where,
      fullTime: overrides.fullTime ?? defaultSummary.fullTime,
    };
    const params: JobSearchParams = {
      q: summary.role
        ? `${summary.role} ${defaultSummary.skills.slice(0, 3).join(" ")}`.trim()
        : defaults.q,
      where: summary.where,
      resultsPerPage: defaults.resultsPerPage,
      maxDaysOld: defaults.maxDaysOld,
      fullTime: summary.fullTime,
    };

    // Cache lookup
    const queryHash = await sha256(canonicalQuery(params, summary));
    const cacheKey = buildCacheKey(user.id, queryHash);
    const cached = cache.get<RecommendationsResponse>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cachedAt: new Date().toISOString() });
    }

    // Fetch from Adzuna
    let rawJobs: Job[];
    try {
      rawJobs = await search(params);
    } catch (err: any) {
      if (err instanceof AdzunaError) {
        return NextResponse.json(
          {
            error: "adzuna_error",
            status: err.status,
            message: err.message,
          },
          { status: err.status === 429 ? 429 : 503 },
        );
      }
      return NextResponse.json(
        { error: "fetch_failed", message: "Could not reach upstream job source." },
        { status: 503 },
      );
    }

    // Score every job
    const resumeSummary = resumeToText(resumeJson as any);
    const { scored, failures } = await scoreAll(rawJobs, resumeSummary);

    // Dedupe, sort, top 25
    const deduped = dedupeByFingerprint(scored);
    deduped.sort((a, b) => b.matchScore - a.matchScore);
    const top25 = deduped.slice(0, 25);

    const response: RecommendationsResponse = {
      jobs: top25,
      query: summary,
      cachedAt: null,
      source: "adzuna",
      totalFetched: rawJobs.length,
      scoreFailures: failures,
    };

    cache.set(cacheKey, response, CACHE_TTL_MS);

    return NextResponse.json(response);
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/jobs/recommendations] unexpected error:", err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * Direct match-scoring helper. Calls the Python backend's /api/match-score
 * without going through the Next.js API route layer (saves an HTTP hop).
 *
 * Used by /api/jobs/recommendations to score every fetched job.
 */

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8003";

export interface MatchResult {
  overall_score: number;
  keyword_matches: string[];
  missing_keywords: string[];
  skill_gaps?: string[];
  suggestions?: string[];
  strengths?: string[];
}

export interface ScoreInput {
  /** Resume summary text (concatenated from personal_info + summary + experience + skills). */
  resumeSummary: string;
  /** Full job description to score against. */
  jobDescription: string;
}

/**
 * Score a resume summary against a job description. Returns null if the
 * Python backend is unreachable (callers should treat null as "unavailable").
 */
export async function scoreMatch(input: ScoreInput): Promise<MatchResult | null> {
  try {
    const res = await fetch(`${PYTHON_API}/api/match-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: { summary: input.resumeSummary },
        job_description: input.jobDescription,
      }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as MatchResult;
  } catch {
    return null;
  }
}

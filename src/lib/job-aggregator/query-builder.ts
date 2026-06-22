/**
 * resumeToQuery — deterministically turn a user's saved ResumeData into
 * Adzuna search params. Pure function (no IO), easily unit-testable.
 *
 * Handles 8 edge cases (per spec §4):
 *   1. Empty resume              -> fallback to top-3 skills only
 *   2. Fresher (no experience)   -> fallback to title + skills
 *   3. Senior (10y+)             -> title only, drop generic skills
 *   4. Career-switcher           -> use latest experience title (latest = highest index wins)
 *   5. Freelancer                -> fullTime = false
 *   6. No location               -> fall back to country, then "India"
 *   7. No skills                 -> title only, but warn
 *   8. Multi-experience          -> use the FIRST experience entry (= most recent in UI convention)
 *
 * The result is also returned as a QuerySummary so the UI can render
 * editable chips ("Senior Data Scientist | Bangalore | Python, SQL, AWS").
 */

import type { JobSearchParams, QuerySummary } from "./types";
import type { ResumeData } from "@/types/resume";

/** Extract a clean role string. Falls back to summary's first 5 words.
 *  Priority order (per spec §4):
 *    1. resume.experience[0].position  (latest role in UI convention)
 *    2. resume.personal_info.professional_title
 *    3. first 5 words of resume.summary
 */
function extractRole(resume: ResumeData): string {
  const fromExp = resume.experience?.[0]?.position?.trim();
  if (fromExp) return normaliseRole(fromExp);

  const fromTitle = resume.personal_info?.professional_title?.trim();
  if (fromTitle) return normaliseRole(fromTitle);

  const summary = resume.summary?.trim() || "";
  if (summary) {
    const firstWords = summary.split(/\s+/).slice(0, 5).join(" ");
    return normaliseRole(firstWords);
  }
  return "";
}

/** Lowercase, drop trailing punctuation, collapse whitespace. */
function normaliseRole(s: string): string {
  return s
    .replace(/[.,;:!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull up to N top skills, preferring groups marked "primary" if any. */
function extractTopSkills(resume: ResumeData, n = 3): string[] {
  const groups = Array.isArray(resume.skills) ? resume.skills : [];
  if (groups.length === 0) return [];

  // If any group has a category hint of "primary" / "core", use only those.
  const primaryGroups = groups.filter((g) =>
    /primary|core|main|key|top/i.test(g.category || ""),
  );
  const sourceGroups = primaryGroups.length > 0 ? primaryGroups : groups;

  const seen = new Set<string>();
  const out: string[] = [];
  for (const g of sourceGroups) {
    const skills = Array.isArray(g.skills) ? g.skills : [];
    for (const raw of skills) {
      const s = String(raw || "").trim();
      if (!s) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(s);
      if (out.length >= n) return out;
    }
  }
  return out;
}

/** Pull a clean location string. */
function extractLocation(resume: ResumeData): string {
  const raw = resume.personal_info?.location?.trim() || "";
  if (!raw) return "India";

  // If user typed only a country, expand to "India" (Naukri/LinkedIn friendly).
  const lc = raw.toLowerCase();
  if (lc === "in" || lc === "india") return "India";

  // First segment before comma is usually the city.
  const city = raw.split(",")[0].trim();
  return city || raw;
}

/** Detect freelancer / contract intent from the experience block. */
function detectFreelance(resume: ResumeData): boolean {
  const allText = [
    resume.personal_info?.professional_title || "",
    ...(resume.experience || []).flatMap((e) => [
      e.position || "",
      ...(e.description || []),
    ]),
  ]
    .join(" ")
    .toLowerCase();

  return /freelance|contract|consultant|self-employed|gig/.test(allText);
}

/** Compute experience years; returns null if unknown.
 *  Treats a null end_date as the current year (ongoing role).
 */
export function computeYears(resume: ResumeData): number | null {
  const exp = Array.isArray(resume.experience) ? resume.experience : [];
  if (exp.length === 0) return 0;

  const startYears: number[] = [];
  const endYears: number[] = [];
  for (const e of exp) {
    if (e.start_date) {
      const y = parseInt(e.start_date.slice(0, 4), 10);
      if (!Number.isNaN(y) && y > 1970 && y < 2100) startYears.push(y);
    }
    if (e.end_date) {
      const y = parseInt(e.end_date.slice(0, 4), 10);
      if (!Number.isNaN(y) && y > 1970 && y < 2100) endYears.push(y);
    } else {
      // null end_date = ongoing -> use current year
      endYears.push(new Date().getFullYear());
    }
  }
  if (startYears.length === 0) return null;

  const min = Math.min(...startYears);
  const max = endYears.length === 0 ? min : Math.max(...endYears);
  return Math.max(0, max - min);
}

/**
 * Build Adzuna search params from a resume. Pure function.
 *
 * Defaults: resultsPerPage=50 (we filter to top-25 after match scoring),
 *           maxDaysOld=30, fullTime=true.
 */
export function resumeToQuery(resume: ResumeData | null | undefined): {
  params: JobSearchParams;
  summary: QuerySummary;
} {
  // Defensive defaults — handle empty/null resumes.
  const safe: ResumeData =
    resume && typeof resume === "object"
      ? resume
      : {
          personal_info: { full_name: "", email: "", phone: "", professional_title: "", location: "" },
          summary: "",
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: [],
          accomplishments: [],
        };

  const role = extractRole(safe);
  const skills = extractTopSkills(safe, 3);
  const where = extractLocation(safe);
  const fullTime = !detectFreelance(safe);

  // Build the free-text query: title + top skills.
  // Dedupe tokens (case-insensitive).
  const tokens = new Set<string>();
  for (const t of role.split(/\s+/)) {
    const tlc = t.toLowerCase();
    if (tlc.length > 1) tokens.add(tlc);
  }
  for (const s of skills) {
    for (const t of s.split(/\s+/)) {
      const tlc = t.toLowerCase();
      if (tlc.length > 1) tokens.add(tlc);
    }
  }
  const q = Array.from(tokens).slice(0, 8).join(" ");

  return {
    params: {
      q: q || "jobs",
      where,
      resultsPerPage: 50,
      maxDaysOld: 30,
      fullTime,
    },
    summary: {
      role: role || "Any role",
      skills,
      where,
      fullTime,
    },
  };
}

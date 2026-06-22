/**
 * Smart Job Discovery — Phase 1 types
 *
 * Public contract for the job-aggregator library. Imported by the API routes,
 * the UI components, and the unit tests.
 *
 * Design rules:
 *  - Job objects are derived from the upstream Adzuna response and NORMALISED
 *    into the shape below. Downstream code never reads raw Adzuna JSON.
 *  - Source attribution is always whatever Adzuna reports. If a job lacks a
 *    source, we set `source: "adzuna"` — we never fabricate Naukri / LinkedIn.
 *  - ScoredJob = Job + matchScore + matchedKeywords + missingKeywords.
 *  - RecommendationsResponse is the wire shape returned by the API route.
 */

/** Where a job listing originated from. Truthfully attributed from Adzuna. */
export type JobSource =
  | "naukri"
  | "linkedin"
  | "indeed"
  | "foundit"
  | "hirist"
  | "monster"
  | "glassdoor"
  | "adzuna"
  | "other";

/** Normalised upstream listing. */
export interface Job {
  /** Upstream aggregator job ID (stable, used for save idempotency). */
  externalId: string;
  title: string;
  company: string;
  /** City + state, or "Remote" / "Hybrid" if the listing says so. */
  location: string;
  /** Full job description text (we keep it for match scoring + display). */
  description: string;
  /** Apply URL on the original source board. */
  url: string;
  /** Truthful source attribution from upstream. */
  source: JobSource;
  /** When the listing was originally posted (ISO 8601). */
  postedAt: string;
  /** Salary string if disclosed (e.g. "₹18L–₹25L PA"), undefined otherwise. */
  salary?: string;
  /** True if the listing says remote OK / work-from-home. */
  remote?: boolean;
}

/** Search params passed to Adzuna. Built deterministically from a resume. */
export interface JobSearchParams {
  /** Free-text query — typically "Senior Data Scientist Python SQL". */
  q: string;
  /** Geo filter — "Bangalore", "India", or empty for global. */
  where: string;
  /** Number of results to fetch before scoring. Default 25. */
  resultsPerPage: number;
  /** Filter out listings older than this many days. Default 30. */
  maxDaysOld: number;
  /** If true, only full-time roles. Defaults to true. */
  fullTime: boolean;
}

/** A Job enriched with a per-user match score. */
export interface ScoredJob extends Job {
  /** 0-100 match score from the existing /api/match-score endpoint. */
  matchScore: number;
  /** Keywords that appear in BOTH the resume and the job description. */
  matchedKeywords: string[];
  /** Keywords the job description uses that the resume is missing. */
  missingKeywords: string[];
  /** True when the match-score call failed for this specific job. */
  scoreUnavailable?: boolean;
}

/** Result of resumeToQuery(). Used to render the QueryEditor chips. */
export interface QuerySummary {
  role: string;
  skills: string[];
  where: string;
  fullTime: boolean;
}

/** Wire shape of POST /api/jobs/recommendations. */
export interface RecommendationsResponse {
  jobs: ScoredJob[];
  query: QuerySummary;
  /** ISO 8601 of when this result was cached, or null if freshly fetched. */
  cachedAt: string | null;
  /** Echo of the upstream provider that supplied these jobs. */
  source: "adzuna";
  /** Total raw jobs returned by Adzuna before scoring/filtering. */
  totalFetched: number;
  /** Number of jobs where match scoring failed. */
  scoreFailures: number;
}

/** Wire shape of POST /api/jobs/save. */
export interface SaveJobRequest {
  externalId: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  source: JobSource;
  description?: string;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  postedAt?: string;
  salary?: string;
}

/** Wire shape of GET /api/jobs/saved. */
export interface SavedJobDTO {
  id: string;
  externalId: string | null;
  title: string;
  company: string;
  location: string | null;
  url: string | null;
  source: string | null;
  matchScore: number | null;
  savedAt: string;
}

/** Deep-link out to Naukri / LinkedIn with pre-filled query. */
export interface DeepLinks {
  naukri: string;
  linkedin: string;
}

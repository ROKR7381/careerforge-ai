/**
 * Build Naukri and LinkedIn deep-link URLs that pre-fill a search with the
 * user's role + location. The user lands on the trusted board's SERP, which
 * gives them brand recognition without us scraping those sites.
 *
 * We do not embed resume skills into these URLs — Naukri's search is single-
 * field ("what:") and stuffing tokens hurts relevance. LinkedIn handles
 * multi-token queries natively.
 */

import type { DeepLinks, QuerySummary } from "./types";

/** Lowercase, hyphenate, drop special chars. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Build Naukri search URL.
 * Pattern: https://www.naukri.com/{role-slug}-jobs-in-{city-slug}
 *   role-slug: hyphenated, no seniority tags (sr/junior handled by filters)
 *   city-slug: optional — "in-{city}" only if city provided, else global search
 *
 * Example: https://www.naukri.com/data-scientist-jobs-in-bangalore
 */
export function buildNaukriLink(q: QuerySummary): string {
  const role = slugify(q.role || "");
  const city = slugify(q.where || "");
  if (role && city) return `https://www.naukri.com/${role}-jobs-in-${city}`;
  if (role) return `https://www.naukri.com/${role}-jobs`;
  if (city) return `https://www.naukri.com/jobs-in-${city}`;
  return "https://www.naukri.com/";
}

/**
 * Build LinkedIn search URL.
 * Pattern: https://www.linkedin.com/jobs/search/?keywords={role}&location={city}
 *   - keywords: original case (LinkedIn tokenises on whitespace)
 *   - location: original case
 *
 * Example: https://www.linkedin.com/jobs/search/?keywords=Senior%20Data%20Scientist&location=Bangalore
 */
export function buildLinkedInLink(q: QuerySummary): string {
  const params = new URLSearchParams();
  if (q.role) params.set("keywords", q.role);
  if (q.where) params.set("location", q.where);
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

/** Convenience: build both at once. */
export function buildDeepLinks(q: QuerySummary): DeepLinks {
  return {
    naukri: buildNaukriLink(q),
    linkedin: buildLinkedInLink(q),
  };
}

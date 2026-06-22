/**
 * Adzuna Jobs API client.
 *
 * Thin, hand-rolled wrapper. We intentionally do NOT pull in the
 * `adzuna-api-wrapper` npm package — it adds 1MB of deps for ~30 lines of fetch
 * logic, and we want to pin Adzuna's response shape in our own types.
 *
 * Auth: ADZUNA_APP_ID + ADZUNA_APP_KEY (env).
 * Country: derived from the `where` param when possible; defaults to "gb".
 *
 * Reference: https://developer.adzuna.com/docs/search
 *
 * URL shape:
 *   GET {ADZUNA_BASE_URL}/jobs/{country}/search/?app_id=...&app_key=...&what=...&where=...&results_per_page=...&max_days_old=...&full_time=...
 */

import type { Job, JobSearchParams, JobSource } from "./types";

const DEFAULT_BASE = "https://api.adzuna.com/v1/api";

/** Errors we throw so callers can distinguish failure modes. */
export class AdzunaError extends Error {
  constructor(public status: number | null, message: string) {
    super(message);
    this.name = "AdzunaError";
  }
}

/**
 * Resolve a 2-letter country code for the Adzuna URL.
 * Adzuna requires this in the path. We default to "gb" (global coverage is
 * weakest for India from "in", so we use "gb" which has the broadest Indian
 * city coverage through their LinkedIn/Naukri/Indeed aggregator deals).
 */
function resolveCountryCode(where: string): string {
  const w = where.toLowerCase().trim();
  if (!w) return "gb";

  // Explicit city → country mapping for India-first audience.
  const indianCities = [
    "bangalore", "bengaluru", "mumbai", "delhi", "new delhi", "gurgaon",
    "gurugram", "noida", "hyderabad", "pune", "chennai", "kolkata", "jaipur",
    "ahmedabad", "indore", "kochi", "coimbatore", "trivandrum", "lucknow",
    "chandigarh", "bhopal", "nagpur", "visakhapatnam", "surat", "vadodara",
  ];
  if (indianCities.some((c) => w.includes(c))) return "in";
  if (w.includes("india")) return "in";

  // Other well-supported markets.
  const countryMap: Record<string, string> = {
    "united kingdom": "gb", "uk": "gb", "england": "gb", "london": "gb",
    "united states": "us", "usa": "us", "new york": "us", "san francisco": "us",
    "australia": "au", "sydney": "au", "melbourne": "au",
    "germany": "de", "berlin": "de",
    "france": "fr", "paris": "fr",
    "netherlands": "nl", "amsterdam": "nl",
    "singapore": "sg",
    "canada": "ca", "toronto": "ca",
    "sweden": "se", "stockholm": "se",
    "ireland": "ie", "dublin": "ie",
    "japan": "jp", "tokyo": "jp",
    "spain": "es",
    "italy": "it",
    "poland": "pl",
    "brazil": "br",
    "mexico": "mx",
    "new zealand": "nz",
    "south africa": "za",
  };
  for (const [needle, code] of Object.entries(countryMap)) {
    if (w.includes(needle)) return code;
  }

  // If the user typed a 2-letter code directly, honour it.
  if (/^[a-z]{2}$/.test(w)) return w;

  // Default to "in" since the user mentioned Naukri / LinkedIn focus.
  return "in";
}

/** Map Adzuna's free-text source field to our strict JobSource union. */
function normaliseSource(raw: string | undefined | null): JobSource {
  if (!raw) return "adzuna";
  const s = raw.toLowerCase();
  if (s.includes("naukri")) return "naukri";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("indeed")) return "indeed";
  if (s.includes("foundit") || s.includes("monster india")) return "foundit";
  if (s.includes("hirist")) return "hirist";
  if (s.includes("glassdoor")) return "glassdoor";
  if (s.includes("monster")) return "monster";
  if (s.includes("adzuna")) return "adzuna";
  return "other";
}

/** Best-effort parsing of the "posted at" string from Adzuna. */
function normalisePostedAt(raw: string | undefined | null): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/** Build a salary string from min/max if disclosed. */
function normaliseSalary(
  min: number | null | undefined,
  max: number | null | undefined,
): string | undefined {
  if (!min && !max) return undefined;
  const fmt = (n: number) => {
    if (n >= 100000) return `${Math.round(n / 100000)}L`;
    if (n >= 1000) return `${Math.round(n / 1000)}k`;
    return String(n);
  };
  if (min && max) return `${fmt(min)}\u2013${fmt(max)}`;
  return `${fmt(min ?? max!)}+`;
}

/**
 * Call Adzuna and return normalised Job[].
 * Throws AdzunaError with a clear status for upstream failure modes.
 */
export async function search(params: JobSearchParams): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new AdzunaError(
      null,
      "ADZUNA_APP_ID and ADZUNA_APP_KEY must be set. See README 'Setting up Smart Job Discovery'.",
    );
  }

  const baseUrl = process.env.ADZUNA_BASE_URL || DEFAULT_BASE;
  const country = resolveCountryCode(params.where);

  const url = new URL(`${baseUrl}/jobs/${country}/search/`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("what", params.q);
  if (params.where) url.searchParams.set("where", params.where);
  url.searchParams.set("results_per_page", String(params.resultsPerPage));
  url.searchParams.set("max_days_old", String(params.maxDaysOld));
  if (params.fullTime) url.searchParams.set("full_time", "1");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
      // 15s is plenty — Adzuna's p95 is ~2s. Long enough for cold-starts.
      signal: AbortSignal.timeout(15000),
      // Adzuna is read-only and benefits from CDN caching; force fresh in dev.
      cache: "no-store",
    });
  } catch (err: any) {
    throw new AdzunaError(null, `Network error reaching Adzuna: ${err?.message || "unknown"}`);
  }

  if (res.status === 401 || res.status === 403) {
    throw new AdzunaError(res.status, "Adzuna rejected credentials. Check ADZUNA_APP_ID / ADZUNA_APP_KEY.");
  }
  if (res.status === 429) {
    throw new AdzunaError(429, "Adzuna rate limit hit. Cache will shield repeat calls.");
  }
  if (res.status >= 500) {
    throw new AdzunaError(res.status, `Adzuna upstream error (${res.status}). Try again shortly.`);
  }
  if (!res.ok) {
    throw new AdzunaError(res.status, `Adzuna returned ${res.status}.`);
  }

  let payload: any;
  try {
    payload = await res.json();
  } catch {
    throw new AdzunaError(res.status, "Adzuna returned malformed JSON.");
  }

  const rawResults: any[] = Array.isArray(payload?.results) ? payload.results : [];
  const jobs: Job[] = [];

  for (const r of rawResults) {
    if (!r || typeof r !== "object") continue;

    // Adzuna's `source` shape varies across plans: sometimes a string,
    // sometimes an object {name, id}, sometimes missing.
    let sourceName: string | undefined;
    if (typeof r.source === "string") sourceName = r.source;
    else if (r.source && typeof r.source.name === "string") sourceName = r.source.name;

    const title = String(r.title || "").trim();
    if (!title) continue; // skip malformed entries

    const description = String(r.description || "").trim();
    if (!description) continue;

    const externalId = String(r.id || "").trim();
    if (!externalId) continue;

    const url = String(r.redirect_url || "").trim();
    if (!url) continue;

    const company =
      typeof r.company === "string"
        ? r.company
        : String(r.company?.display_name || "").trim();

    const location =
      typeof r.location === "string"
        ? r.location
        : String(r.location?.display_name || params.where || "").trim();

    jobs.push({
      externalId,
      title,
      company: company || "Unknown company",
      location: location || params.where || "Remote",
      description,
      url,
      source: normaliseSource(sourceName),
      postedAt: normalisePostedAt(r.created),
      salary: normaliseSalary(r.salary_min, r.salary_max),
      remote:
        /remote|work from home|wfh/i.test(`${title} ${description} ${location}`),
    });
  }

  return jobs;
}

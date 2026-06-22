/**
 * Tiny cache for job recommendations.
 *
 * Phase 1 uses an in-memory Map with TTL. Sufficient for MVP because:
 *   - Next.js dev server is single-process; production on Vercel uses
 *     serverless functions, but cache hits within a single function instance
 *     still help, and the recommendations route is a POST that Vercel will
 *     pin to the same region.
 *   - Phase 2 (deferred) can swap this implementation for Redis by exporting
 *     a different `cache` while keeping the same interface.
 *
 * If REDIS_URL is set in env, the constructor will warn the user that
 * Redis is configured but not yet wired — easy follow-up.
 *
 * IMPORTANT: this is per-process. Don't use for anything you can't
 * recompute. Don't share between users without scoping by userId in the key.
 */

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry>();

/** Scan-and-evict on every 100th write so the map doesn't grow forever. */
let writesSinceSweep = 0;
const SWEEP_INTERVAL = 100;

function sweep(): void {
  const now = Date.now();
  for (const [k, v] of memoryStore.entries()) {
    if (v.expiresAt <= now) memoryStore.delete(k);
  }
}

/** Warn once if Redis is configured but not yet wired. */
let warnedAboutRedis = false;

export const cache = {
  /** Retrieve a cached value; returns null on miss or expiry. */
  get<T>(key: string): T | null {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value as T;
  },

  /** Store a value with a TTL (default 24h). */
  set<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
    if (!warnedAboutRedis && process.env.REDIS_URL) {
      console.warn(
        "[job-aggregator/cache] REDIS_URL is set but Redis is not yet wired in Phase 1. Using in-memory cache (per-process).",
      );
      warnedAboutRedis = true;
    }
    memoryStore.set(key, { value, expiresAt: Date.now() + ttlMs });
    writesSinceSweep += 1;
    if (writesSinceSweep >= SWEEP_INTERVAL) {
      writesSinceSweep = 0;
      sweep();
    }
  },

  /** Invalidate all keys with a given prefix (e.g. "jobs:user123:"). */
  invalidatePrefix(prefix: string): number {
    let removed = 0;
    for (const k of Array.from(memoryStore.keys())) {
      if (k.startsWith(prefix)) {
        memoryStore.delete(k);
        removed += 1;
      }
    }
    return removed;
  },

  /** Test-only: clear everything. Do not call from app code. */
  _clearAll(): void {
    memoryStore.clear();
  },
};

/**
 * Build a stable cache key for a user + query combination.
 * Used by /api/jobs/recommendations to scope cache per user.
 */
export function buildCacheKey(userId: string, queryHash: string): string {
  return `jobs:${userId}:${queryHash}`;
}

/** SHA-256 of a string, hex-encoded. Available in Node since v15. */
export async function sha256(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * POST /api/jobs/refresh
 *   Invalidates the recommendations cache for the current user.
 *   The next /api/jobs/recommendations call will re-fetch from Adzuna.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { cache } from "@/lib/job-aggregator/cache";

export async function POST() {
  try {
    const user = await requireAuth();
    const removed = cache.invalidatePrefix(`jobs:${user.id}:`);
    return NextResponse.json({
      invalidated: removed,
      message:
        removed > 0
          ? `Cleared ${removed} cached recommendation${removed === 1 ? "" : "s"}.`
          : "Nothing to clear.",
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/jobs/refresh POST] error:", err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown" },
      { status: 500 },
    );
  }
}

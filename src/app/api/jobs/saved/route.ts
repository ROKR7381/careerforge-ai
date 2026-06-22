/**
 * GET /api/jobs/saved
 *   Returns the authenticated user's saved jobs, newest first.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SavedJobDTO } from "@/lib/job-aggregator/types";

export async function GET() {
  try {
    const user = await requireAuth();

    const rows = await prisma.savedJob.findMany({
      where: { userId: user.id, saved: true },
      orderBy: { createdAt: "desc" },
      take: 200, // sane cap
    });

    const jobs: SavedJobDTO[] = rows.map((row) => ({
      id: row.id,
      externalId: row.externalId ?? null,
      title: row.jobTitle,
      company: row.company,
      location: row.location ?? null,
      url: row.url ?? null,
      source: row.source ?? null,
      matchScore: row.matchScore != null ? Math.round(row.matchScore) : null,
      savedAt: row.createdAt.toISOString(),
    }));

    return NextResponse.json({ jobs });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/jobs/saved GET] error:", err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown" },
      { status: 500 },
    );
  }
}

/**
 * /api/jobs/save
 *   POST   — bookmark a job (idempotent on userId + externalId)
 *   DELETE — unbookmark by externalId (no-op if not saved)
 */

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SaveJobRequest, SavedJobDTO } from "@/lib/job-aggregator/types";

function toDTO(row: any): SavedJobDTO {
  return {
    id: row.id,
    externalId: row.externalId ?? null,
    title: row.jobTitle,
    company: row.company,
    location: row.location ?? null,
    url: row.url ?? null,
    source: row.source ?? null,
    matchScore: row.matchScore != null ? Math.round(row.matchScore) : null,
    savedAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  };
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = (await req.json()) as SaveJobRequest;

    if (!body.externalId || !body.title || !body.company || !body.url) {
      return NextResponse.json(
        { error: "missing_fields", message: "externalId, title, company, url are required." },
        { status: 400 },
      );
    }

    // Idempotent upsert on (userId, externalId). If externalId is null,
    // Prisma's @@unique treats NULLs as distinct in PostgreSQL — so we
    // additionally dedupe by (userId, url) before insert.
    const existing = await prisma.savedJob.findUnique({
      where: { userId_externalId: { userId: user.id, externalId: body.externalId } },
    });
    if (existing) {
      const hasMatchData = !!(body.matchedKeywords || body.missingKeywords);
      const matchDataUpdate = hasMatchData
        ? { matched: body.matchedKeywords ?? [], missing: body.missingKeywords ?? [] }
        : undefined;
      // Update mutable fields in case the user re-saved with newer data
      const updated = await prisma.savedJob.update({
        where: { id: existing.id },
        data: {
          jobTitle: body.title,
          company: body.company,
          location: body.location ?? existing.location,
          url: body.url,
          source: body.source ?? existing.source,
          description: body.description ?? existing.description,
          matchScore: body.matchScore ?? existing.matchScore,
          ...(matchDataUpdate ? { matchData: matchDataUpdate } : {}),
          postedDate: body.postedAt ? new Date(body.postedAt) : existing.postedDate,
          salary: body.salary ?? existing.salary,
          saved: true,
        },
      });
      return NextResponse.json({ saved: toDTO(updated), created: false });
    }

    // Insert new
    const hasMatchData = !!(body.matchedKeywords || body.missingKeywords);
    const matchData = hasMatchData
      ? { matched: body.matchedKeywords ?? [], missing: body.missingKeywords ?? [] }
      : Prisma.JsonNull;
    const created = await prisma.savedJob.create({
      data: {
        userId: user.id,
        externalId: body.externalId,
        jobTitle: body.title,
        company: body.company,
        location: body.location ?? null,
        url: body.url,
        source: body.source ?? null,
        description: body.description ?? null,
        matchScore: body.matchScore ?? null,
        matchData: matchData as Prisma.InputJsonValue,
        postedDate: body.postedAt ? new Date(body.postedAt) : null,
        salary: body.salary ?? null,
        saved: true,
      },
    });
    return NextResponse.json({ saved: toDTO(created), created: true });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/jobs/save POST] error:", err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const externalId = searchParams.get("externalId");
    if (!externalId) {
      return NextResponse.json(
        { error: "missing_externalId", message: "externalId query param required." },
        { status: 400 },
      );
    }

    const result = await prisma.savedJob.deleteMany({
      where: { userId: user.id, externalId },
    });

    return NextResponse.json({ removed: result.count });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/jobs/save DELETE] error:", err);
    return NextResponse.json(
      { error: "internal_error", message: err?.message || "Unknown" },
      { status: 500 },
    );
  }
}

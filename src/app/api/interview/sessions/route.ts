import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ sessions });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const interview = await prisma.interviewSession.create({
      data: {
        userId: session.id,
        jobTitle: body.jobTitle,
        jobDescription: body.jobDescription,
        questions: body.questions,
        transcript: body.transcript,
        feedback: body.feedback,
        overallScore: body.overallScore,
        completed: body.completed || false,
      },
    });

    return NextResponse.json({ session: interview }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

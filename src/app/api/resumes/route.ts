import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();
    const resumes = await prisma.resume.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ resumes });
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

    const resume = await prisma.resume.create({
      data: {
        userId: session.id,
        title: body.title || "Untitled Resume",
        templateName: body.templateName || "dublin",
        resumeJson: body.resumeJson || {},
        photoBase64: body.photoBase64,
      },
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

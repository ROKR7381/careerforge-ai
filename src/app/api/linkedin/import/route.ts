import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { parseLinkedInText, looksLikeLinkedInExport } from "@/lib/linkedin-parser";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const text: string | undefined = body?.text;

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "No text provided or text too short. Upload a LinkedIn Data Export PDF." },
        { status: 400 }
      );
    }

    if (!looksLikeLinkedInExport(text)) {
      return NextResponse.json(
        {
          error:
            "This doesn't look like a LinkedIn profile export. Please download your profile from LinkedIn Settings → Get a copy of your data.",
        },
        { status: 400 }
      );
    }

    const resume = parseLinkedInText(text);
    return NextResponse.json({ resume });
  } catch (err: any) {
    console.error("LinkedIn import error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to parse LinkedIn profile" },
      { status: 500 }
    );
  }
}

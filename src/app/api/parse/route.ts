import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const mammoth: any = require("mammoth");

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = file.name.toLowerCase();
    let text = "";

    if (filename.endsWith(".pdf")) {
      // Fast path: extract raw PDF text by finding BT...ET blocks.
      // This is a simple fallback — the ATS page now parses PDFs client-side.
      const raw = buffer.toString("binary");
      const matches = raw.match(/\(([^)]*)\)\s*Tj/g);
      if (matches) {
        text = matches.map((m: string) => {
          const s = m.match(/\(([^)]*)\)/);
          return s ? s[1] : "";
        }).join(" ").trim();
      }
      if (!text) throw new Error("No text found in PDF (may be scanned/image-based)");
    } else if (filename.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = (result.value || "").trim();
      if (!text) throw new Error("Failed to extract text from DOCX");
    } else if (filename.endsWith(".txt")) {
      text = buffer.toString("utf-8").trim();
      if (!text) throw new Error("Empty file");
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "File parsing failed" },
      { status: 500 }
    );
  }
}

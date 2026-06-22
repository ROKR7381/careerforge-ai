import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8003";

export async function POST(req: Request) {
  try {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    try {
      const res = await fetch(`${PYTHON_API}/api/cover-letter/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e: any) {
      console.error("FastAPI cover letter fail:", e);
    }

    return NextResponse.json({ error: "Failed to generate cover letter. Ensure the Python backend is running." }, { status: 503 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

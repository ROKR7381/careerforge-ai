import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Try Python backend first
    try {
      const res = await fetch(`${PYTHON_API}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(300000), // 5 minutes for full resume processing
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {
      // Python backend not available — fall through to fallback
    }

    // Fallback: simple prompt-based optimization using Next.js
    // (For now, return a message explaining the Python backend is needed)
    return NextResponse.json({
      error: "AI optimization requires the Python backend. Start it with: cd python-backend && uvicorn main:app --reload",
    }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

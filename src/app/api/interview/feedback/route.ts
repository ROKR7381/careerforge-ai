import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();

    try {
      const res = await fetch(`${PYTHON_API}/api/interview/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}

    return NextResponse.json({ error: "Interview feedback requires the Python backend" }, { status: 503 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

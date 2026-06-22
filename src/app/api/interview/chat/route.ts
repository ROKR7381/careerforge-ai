import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8003";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const res = await fetch(`${PYTHON_API}/api/interview/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": user.id,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Backend error" }));
      return NextResponse.json({ error: err.detail }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

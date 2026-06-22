import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    try {
      if (body.format === "excel") {
        const res = await fetch(`${PYTHON_API}/api/export/excel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const blob = await res.blob();
          return new NextResponse(blob, {
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "Content-Disposition": "attachment; filename=resume.xlsx",
            },
          });
        }
      }

      if (body.format === "html") {
        const res = await fetch(`${PYTHON_API}/api/export/html`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) return NextResponse.json(await res.json());
      }

      // PDF proxy: get HTML first, then we'd use Puppeteer
      if (body.format === "pdf") {
        const res = await fetch(`${PYTHON_API}/api/export/html`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: body.resume, template_name: body.templateName }),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ html: data.html });
        }
      }
    } catch {
      // Python backend not available
    }

    return NextResponse.json({
      error: "Export requires the Python backend. Start it with: cd python-backend && uvicorn main:app --reload",
    }, { status: 503 });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

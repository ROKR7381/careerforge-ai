import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

/**
 * Paid export formats — these require any non-FREE subscription plan.
 * FREE users can build, edit, and preview their resume in-app, but every
 * download surface is gated. Server-side enforcement is non-negotiable
 * because the browser-side gate can be bypassed by anyone with DevTools.
 */
const PAID_FORMATS = new Set(["pdf", "excel", "html"]);

/** Maps the request format to the human-readable action we show in errors. */
const FORMAT_LABELS: Record<string, string> = {
  pdf: "Download as PDF",
  excel: "Download as Excel",
  html: "Export to HTML",
};

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    // Plan gate — runs *before* we touch the Python backend so we don't
    // waste cycles on a request that's going to be rejected anyway.
    const requestedFormat = (body.format || "pdf").toString().toLowerCase();
    if (PAID_FORMATS.has(requestedFormat)) {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { subscriptionPlan: true, subscriptionStatus: true },
      });

      const isPaid =
        user &&
        user.subscriptionPlan !== "FREE" &&
        // Defensive: an EXPIRED / CANCELED subscription shouldn't get
        // paid downloads even if the enum still says PREMIUM_*.
        user.subscriptionStatus !== "EXPIRED" &&
        user.subscriptionStatus !== "CANCELED";

      if (!isPaid) {
        return NextResponse.json(
          {
            error: "SUBSCRIPTION_REQUIRED",
            message:
              "Resume downloads are a Pro feature. Start a 7-day trial for ₹249 or subscribe from ₹349/month.",
            upgradeUrl: "/billing?plan=TRIAL",
            cheapestPlan: {
              id: "TRIAL",
              name: "7-Day Pro Trial",
              priceInr: 249,
            },
            format: requestedFormat,
            action: FORMAT_LABELS[requestedFormat] || "Download resume",
          },
          { status: 402 } // 402 Payment Required
        );
      }
    }

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
              "Content-Type":
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
          body: JSON.stringify({
            resume: body.resume,
            template_name: body.templateName,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ html: data.html });
        }
      }
    } catch {
      // Python backend not available
    }

    return NextResponse.json(
      {
        error:
          "Export requires the Python backend. Start it with: cd python-backend && uvicorn main:app --reload",
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

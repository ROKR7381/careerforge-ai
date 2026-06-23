import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import type { ResumeData } from "@/types/resume";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

interface OptimizeRequest {
  resume: ResumeData;
  /** Which sections to optimize. Default: ["summary", "experience"] */
  sections?: ("summary" | "experience" | "headline")[];
}

/**
 * Optimize a LinkedIn-derived resume using the Python AI backend.
 * Reuses the existing /api/optimize pipeline with LinkedIn-specific instructions.
 *
 * Note: This endpoint exists as a separate route so we can later add
 * LinkedIn-specific prompting (e.g. shorter bullets, more conversational tone)
 * without changing the main /api/optimize contract.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: OptimizeRequest = await req.json();
    const { resume, sections = ["headline", "summary", "experience"] } = body;

    if (!resume?.personal_info?.full_name) {
      return NextResponse.json(
        { error: "Invalid resume data: missing personal_info" },
        { status: 400 }
      );
    }

    // LinkedIn-specific optimization prompt — tighter, more conversational,
    // emphasizes achievements over responsibilities.
    const linkedinInstructions = `You are optimizing a resume derived from a LinkedIn profile for use on CareerForge AI.

LinkedIn-specific rules:
- Headline: 120 char max. Must include role + 2-3 strongest keywords + value prop.
- Summary: 200-300 words. First-person, story-driven, no "I am a..." openers.
- Experience bullets: 3-5 per role. Each starts with a strong action verb,
  includes a metric or measurable impact, and follows the XYZ formula
  ("Accomplished [X], as measured by [Y], by doing [Z]").
- Remove LinkedIn-specific filler like "Full-time", "connections", endorsements.
- Preserve dates, company names, and job titles exactly.

Return the FULL resume JSON with ONLY the optimized sections changed.
Do not modify personal_info fields like name, email, phone, location.`;

    // Try Python backend first
    try {
      const res = await fetch(`${PYTHON_API}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          instructions: linkedinInstructions,
        }),
        signal: AbortSignal.timeout(120000),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          optimized: data.optimized_resume || data.resume || data,
          sections,
        });
      }
    } catch {
      // Python backend unavailable — fall through to rule-based fallback
    }

    // Fallback: rule-based rewrites (no AI required, but lower quality)
    const optimized = JSON.parse(JSON.stringify(resume)) as ResumeData;

    // Headline: capitalize + add keywords if missing
    if (sections.includes("headline") && optimized.personal_info.professional_title) {
      const title = optimized.personal_info.professional_title;
      if (!/\|/.test(title) && title.length < 80) {
        optimized.personal_info.professional_title = `${title} | Driving Impact Through Innovation`;
      }
    }

    // Summary: trim and add power statement if too short
    if (sections.includes("summary") && optimized.summary) {
      if (optimized.summary.length < 100) {
        optimized.summary = `${optimized.summary} Passionate about delivering measurable results and building high-performing teams.`;
      } else if (optimized.summary.length > 600) {
        optimized.summary = optimized.summary.slice(0, 580).trim() + "…";
      }
    }

    // Experience bullets: ensure each starts with a strong verb
    if (sections.includes("experience")) {
      const WEAK_STARTERS = /^(the |a |an |i |we |responsible for |worked on |helped |did |was |managed to )/i;
      const STRONG_VERBS = ["Led", "Built", "Drove", "Delivered", "Launched", "Spearheaded", "Designed", "Optimized"];
      for (const exp of optimized.experience) {
        exp.description = exp.description.map((bullet, idx) => {
          if (!bullet || bullet.length < 5) return bullet;
          if (WEAK_STARTERS.test(bullet)) {
            const verb = STRONG_VERBS[idx % STRONG_VERBS.length];
            return bullet.replace(WEAK_STARTERS, `${verb} `);
          }
          return bullet;
        });
      }
    }

    return NextResponse.json({
      optimized,
      sections,
      _fallback: true,
    });
  } catch (err: any) {
    console.error("LinkedIn optimize error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to optimize LinkedIn profile" },
      { status: 500 }
    );
  }
}

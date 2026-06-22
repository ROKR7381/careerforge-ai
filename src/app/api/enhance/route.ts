import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

/** Quick parser that builds a ResumeData object from raw text as a robust fallback. */
function buildResumeFromText(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const fullName =
    lines.find((l) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(l)) ||
    lines[0] || "";
  const email =
    lines.find((l) => /[\w.-]+@[\w.-]+\.\w+/.test(l))?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || "";
  const phone =
    lines.find((l) => /[\d\-+()]{7,}/.test(l))?.match(/[\d\-+()]{7,}/)?.[0] || "";
  const location =
    lines.find((l) => /[A-Z][a-z]+,\s*[A-Z]{2}/.test(l)) || "";

  // Collect all skill-like words
  const skillKeywords = [
    "python", "javascript", "typescript", "java", "c++", "go", "rust",
    "react", "angular", "vue", "node", "express", "django", "flask",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "sql", "postgresql", "mysql", "mongodb", "redis",
    "git", "linux", "ci/cd", "rest", "graphql", "api",
  ];
  const foundSkills = skillKeywords.filter((s) =>
    text.toLowerCase().includes(s)
  );

  // Collect experience entries
  const experience: any[] = [];
  let i = 0;
  while (i < lines.length) {
    if (/(engineer|developer|intern|lead|manager|architect)/i.test(lines[i]) &&
        /\d{4}/.test(lines[i + 1] || "")) {
      const position = lines[i];
      const dateLine = lines[i + 1] || "";
      const company = lines[i + 2] || "";
      const descLines: string[] = [];
      let j = i + 3;
      while (j < lines.length && !/\d{4}/.test(lines[j]) && lines[j].length < 100) {
        descLines.push(lines[j]);
        j++;
      }
      experience.push({
        company,
        position,
        location: "",
        start_date: dateLine.split("–")[0]?.trim() || dateLine,
        end_date: dateLine.split("–")[1]?.trim() || null,
        description: descLines.length ? descLines : [],
      });
      i = j;
    } else {
      i++;
    }
  }

  return {
    personal_info: {
      full_name: fullName,
      professional_title: foundSkills.length > 0 ? "Software Engineer" : "",
      email,
      phone,
      location,
      linkedin: null,
      github: null,
      website: null,
      nationality: null,
      hobbies: null,
      power_statement: null,
      photo_base64: null,
    },
    summary: `Experienced professional with expertise in ${foundSkills.slice(0, 5).join(", ") || "software development"}.`,
    experience: experience.length > 0 ? experience : [
      {
        company: "",
        position: "Professional Role",
        location: "",
        start_date: "",
        end_date: null,
        description: [],
      },
    ],
    education: [
      {
        institution: "",
        degree: "",
        location: "",
        start_date: "",
        end_date: "",
        description: null,
      },
    ],
    skills: [
      {
        category: "Technical Skills",
        skills: foundSkills.length > 0 ? foundSkills : ["Programming"],
      },
    ],
    projects: [],
    certifications: [],
    languages: [],
    accomplishments: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resume_text } = body;

    if (!resume_text || resume_text.trim().length < 10) {
      return NextResponse.json(
        { error: "Resume text is too short. Please paste your full resume." },
        { status: 400 }
      );
    }

    // Try Python AI Backend first
    try {
      const res = await fetch(`${PYTHON_API}/api/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text }),
        signal: AbortSignal.timeout(180000), // 3 minutes timeout
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Python backend error:", errData);
      }
    } catch (err: any) {
      console.error("Failed to connect to Python backend, falling back to local parser:", err);
    }

    // Fallback: Parse raw text locally if AI backend is down, rate-limited, or has invalid keys
    const fallbackResume = buildResumeFromText(resume_text);
    return NextResponse.json({ resume: fallbackResume, fallback: true });

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Enhancement failed" },
      { status: 500 }
    );
  }
}

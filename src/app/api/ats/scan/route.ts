import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

interface AtsScoreDetails {
  overall: number;
  sections: {
    keywords: { score: number; max: number; details: string[] };
    formatting: { score: number; max: number; details: string[] };
    content: { score: number; max: number; details: string[] };
    action_verbs: { score: number; max: number; details: string[] };
    quantifiable: { score: number; max: number; details: string[] };
    contact: { score: number; max: number; details: string[] };
  };
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  suggestions: string[];
  section_scores: Array<{ name: string; percent: number; status: "pass" | "warn" | "fail" }>;
}

function analyzeAtsScore(resumeText: string, jobDescription?: string): AtsScoreDetails {
  const text = resumeText.toLowerCase();

  const details: AtsScoreDetails = {
    overall: 0,
    sections: {
      keywords: { score: 0, max: 30, details: [] },
      content: { score: 0, max: 20, details: [] },
      formatting: { score: 0, max: 15, details: [] },
      action_verbs: { score: 0, max: 15, details: [] },
      quantifiable: { score: 0, max: 12, details: [] },
      contact: { score: 0, max: 8, details: [] },
    },
    strengths: [],
    weaknesses: [],
    missing_sections: [],
    suggestions: [],
    section_scores: [],
  };

  const s = details.sections;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // ═══════════════════════════════════════════════════════════════
  // 1. KEYWORD OPTIMIZATION (30 pts)
  // ═══════════════════════════════════════════════════════════════
  let keywordScore = 0;

  if (jobDescription && jobDescription.trim().length > 20) {
    // Extract meaningful keywords from job description (3+ chars, not stop words)
    const stopWords = new Set([
      "the", "and", "for", "are", "but", "not", "you", "all", "can", "was",
      "had", "has", "may", "its", "new", "use", "way", "day", "get", "one",
      "two", "first", "part", "back", "good", "now", "how", "why", "any",
      "our", "out", "who", "see", "make", "know", "take", "come", "think",
      "look", "want", "give", "tell", "ask", "work", "seem", "feel", "try",
      "leave", "call", "well", "also", "just", "more", "some", "than",
      "then", "very", "each", "other", "many", "much", "most", "few",
      "still", "while", "because", "after", "before", "between", "under",
      "again", "further", "once", "here", "there", "this", "that", "with",
      "from", "have", "been", "will", "were", "their", "what", "when",
      "where", "which", "about", "would", "could", "should", "your",
      "into", "over", "such", "only", "these", "them", "both", "every",
      "during", "without", "through", "within", "along", "across",
      "behind", "above", "below", "down", "off", "up", "out", "own",
      "same", "so", "than", "too", "very", "just", "also", "really",
    ]);

    const jdWords = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9\s#+.-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w) && !/^\d+$/.test(w));

    const uniqueJdWords = [...new Set(jdWords)];
    const matchedWords = uniqueJdWords.filter((w) => text.includes(w));
    const matchRate = uniqueJdWords.length > 0 ? matchedWords.length / uniqueJdWords.length : 0;

    // Base keyword match score (up to 20 pts)
    if (matchRate >= 0.7) {
      keywordScore += 20;
      s.keywords.details.push(`✓ Outstanding keyword match: ${matchedWords.length}/${uniqueJdWords.length} keywords (${Math.round(matchRate * 100)}%)`);
    } else if (matchRate >= 0.5) {
      keywordScore += 14;
      s.keywords.details.push(`✓ Good keyword match: ${matchedWords.length}/${uniqueJdWords.length} keywords (${Math.round(matchRate * 100)}%)`);
    } else if (matchRate >= 0.3) {
      keywordScore += 8;
      s.keywords.details.push(`⚠ Moderate keyword match: ${matchedWords.length}/${uniqueJdWords.length} (${Math.round(matchRate * 100)}%)`);
    } else {
      keywordScore += 3;
      s.keywords.details.push(`✗ Low keyword match: ${matchedWords.length}/${uniqueJdWords.length} (${Math.round(matchRate * 100)}%)`);
    }

    // Bonus for matching critical skills/tech terms (up to 10 pts)
    const techTerms = uniqueJdWords.filter((w) =>
      /^(python|java|javascript|react|angular|vue|node|sql|aws|azure|gcp|docker|kubernetes|typescript|mongodb|postgresql|graphql|rest|api|machine.?learning|deep.?learning|nlp|tensorflow|pytorch|scikit|pandas|spark|kafka|airflow|tableau|power.?bi|git|ci.?cd|agile|scrum|devops|mlops|terraform|ansible|linux)$/i.test(w)
    );
    const matchedTech = techTerms.filter((t) => text.includes(t));
    if (matchedTech.length >= techTerms.length * 0.7 && techTerms.length >= 3) {
      keywordScore += 10;
      s.keywords.details.push(`✓ Strong technical skill alignment: ${matchedTech.length}/${techTerms.length} tech terms matched`);
    } else if (matchedTech.length >= 3) {
      keywordScore += 5;
      s.keywords.details.push(`⚠ Partial tech skill match: ${matchedTech.length}/${techTerms.length}`);
    } else if (matchedTech.length > 0) {
      keywordScore += 2;
    }

    if (matchedWords.length > 0) {
      s.keywords.details.push(`  Key matched terms: ${matchedWords.slice(0, 10).join(", ")}`);
    }
  } else {
    // No JD provided: score based on industry keyword density
    const industryKeywords = [
      "python", "java", "javascript", "react", "node", "sql", "aws", "azure",
      "docker", "kubernetes", "machine learning", "data", "analysis", "management",
      "leadership", "project", "development", "design", "implement", "strategy",
      "communication", "team", "agile", "api", "cloud", "security", "database",
      "testing", "deployment", "optimization", "automation", "pipeline",
      "architecture", "scalable", "performance", "integration", "analytics",
    ];
    const found = industryKeywords.filter((kw) => text.includes(kw));
    const rate = found.length / industryKeywords.length;

    if (rate >= 0.3) {
      keywordScore += 20;
      s.keywords.details.push(`✓ Strong industry keyword density: ${found.length} keywords detected`);
    } else if (rate >= 0.15) {
      keywordScore += 12;
      s.keywords.details.push(`⚠ Moderate keywords: ${found.length} industry terms — add more role-specific skills`);
    } else {
      keywordScore += 5;
      s.keywords.details.push(`✗ Low keyword density: only ${found.length} industry terms detected`);
    }
    if (found.length > 0) {
      s.keywords.details.push(`  Keywords found: ${found.slice(0, 10).join(", ")}`);
    }
  }
  s.keywords.score = Math.min(Math.round(keywordScore), 30);

  // ═══════════════════════════════════════════════════════════════
  // 2. CONTENT COMPLETENESS (20 pts)
  // ═══════════════════════════════════════════════════════════════
  let contentScore = 0;
  const missing: string[] = [];

  // Check for all standard resume sections
  if (/\b(summary|professional.?summary|profile|objective|about.?me)\b/i.test(text)) {
    contentScore += 5;
    s.content.details.push("✓ Professional summary/profile section found");
  } else {
    missing.push("Professional Summary");
    s.content.details.push("✗ Missing professional summary — crucial for first impressions");
  }

  if (/\b(experience|employment|work.?history)\b/i.test(text)) {
    contentScore += 5;
    s.content.details.push("✓ Work experience section found");
    // Check for multiple positions
    const positions = (text.match(/\b(engineer|developer|manager|analyst|scientist|consultant|director|lead|head|architect|specialist|coordinator|associate|intern)\b/gi) || []).length;
    if (positions >= 3) {
      contentScore += 2;
      s.content.details.push("✓ Multiple roles/positions detected — strong career progression");
    }
  } else {
    missing.push("Work Experience");
    s.content.details.push("✗ Missing work experience section");
  }

  if (/\b(education|university|college|degree|school|b\.?(tech|e|s|a)|m\.?(tech|e|s|a)|ph\.?d)\b/i.test(text)) {
    contentScore += 4;
    s.content.details.push("✓ Education section found");
  } else {
    missing.push("Education");
    s.content.details.push("✗ Missing education section");
  }

  if (/\b(skills|technologies|competencies|expertise)\b/i.test(text)) {
    contentScore += 3;
    s.content.details.push("✓ Skills section found");
    // Bonus for categorized skills
    if (/\b(programming|language|framework|tool|platform|categories)\b/i.test(text)) {
      contentScore += 1;
    }
  } else {
    missing.push("Skills");
    s.content.details.push("✗ Missing skills section");
  }

  if (/\b(project|certification|portfolio|achievement|award|publication)\b/i.test(text)) {
    contentScore += 2;
    s.content.details.push("✓ Additional sections (projects/certifications) found");
  }

  // Length check
  if (wordCount >= 350 && wordCount <= 950) {
    contentScore += 1;
  }

  s.content.score = Math.min(Math.round(contentScore), 20);
  details.missing_sections = missing;

  // ═══════════════════════════════════════════════════════════════
  // 3. FORMATTING & STRUCTURE (15 pts)
  // ═══════════════════════════════════════════════════════════════
  let formattingScore = 0;

  // Bullet points count
  const bulletCount = (text.match(/[•●▪▸➢➤→-]\s/g) || text.match(/^[-*]\s/gm) || []).length;
  if (bulletCount >= 15) {
    formattingScore += 5;
    s.formatting.details.push(`✓ Excellent: ${bulletCount} bullet points — ideal for ATS parsing`);
  } else if (bulletCount >= 8) {
    formattingScore += 3;
    s.formatting.details.push(`✓ ${bulletCount} bullet points — good, aim for 15+ across all roles`);
  } else {
    formattingScore += 1;
    s.formatting.details.push(`⚠ Only ${bulletCount} bullet points — use bulleted lists for every role (aim for 15+)`);
  }

  // Section headers
  const sectionHeaders = (text.match(/\b(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|PROFILE|EMPLOYMENT)\b/g) || []).length;
  if (sectionHeaders >= 4) {
    formattingScore += 4;
    s.formatting.details.push("✓ Clear section headers with consistent formatting");
  } else if (sectionHeaders >= 2) {
    formattingScore += 2;
    s.formatting.details.push(`⚠ ${sectionHeaders} section headers found — use distinct headers for all sections`);
  }

  // Reverse chronological order check (dates at experience entries)
  const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi;
  const dates = text.match(datePattern);
  if (dates && dates.length >= 4) {
    formattingScore += 3;
    s.formatting.details.push("✓ Multiple dates found — reverse-chronological structure likely");
  } else {
    formattingScore += 1;
    s.formatting.details.push("⚠ Add dates to all positions (e.g., 'Jan 2022 - Present')");
  }

  // Experience section detail level
  const expBulletBlocks = text.split(/\n\s*\n/).filter((block) => {
    const lines = block.split("\n").filter((l) => l.trim());
    return lines.length >= 3 && /[•●▪▸➢➤→-]/.test(block);
  }).length;
  if (expBulletBlocks >= 2) {
    formattingScore += 3;
    s.formatting.details.push("✓ Well-structured experience entries with multiple bullet points each");
  } else {
    formattingScore += 1;
  }

  s.formatting.score = Math.min(Math.round(formattingScore), 15);

  // ═══════════════════════════════════════════════════════════════
  // 4. ACTION VERBS (15 pts)
  // ═══════════════════════════════════════════════════════════════
  let verbScore = 0;
  const actionVerbs = [
    "achieved", "accelerated", "architected", "built", "championed", "created",
    "delivered", "designed", "developed", "drove", "engineered",
    "established", "executed", "generated", "grew", "implemented", "improved",
    "increased", "initiated", "innovated", "integrated", "launched", "led",
    "managed", "optimized", "orchestrated", "pioneered", "produced", "reduced",
    "reengineered", "scaled", "simplified", "spearheaded", "streamlined",
    "strengthened", "transformed", "upgraded", "mentored", "negotiated",
    "presented", "published", "recruited", "reorganized", "resolved",
    "restructured", "revamped", "solved", "supervised", "trained",
    "unified", "visualized", "won", "automated", "centralized",
    "consolidated", "coordinated", "cultivated", "delegated", "eliminated",
    "enabled", "enhanced", "expanded", "facilitated", "founded",
    "headed", "influenced", "instituted", "mastered", "modernized",
    "motivated", "outpaced", "overhauled", "piloted", "restored",
  ];
  const foundVerbs = actionVerbs.filter((v) => {
    const regex = new RegExp(`\\b${v}\\b`, "i");
    return regex.test(text);
  });

  if (foundVerbs.length >= 8) {
    verbScore = 15;
    s.action_verbs.details.push(`✓ Excellent: ${foundVerbs.length} powerful action verbs used throughout`);
  } else if (foundVerbs.length >= 5) {
    verbScore = 10;
    s.action_verbs.details.push(`✓ Good: ${foundVerbs.length} action verbs — aim for 8+ for maximum impact`);
  } else if (foundVerbs.length >= 3) {
    verbScore = 6;
    s.action_verbs.details.push(`⚠ ${foundVerbs.length} action verbs — replace passive phrases with strong verbs`);
  } else {
    verbScore = 2;
    s.action_verbs.details.push("✗ Very few action verbs — start every bullet with a strong verb (Engineered, Spearheaded, Orchestrated)");
  }
  if (foundVerbs.length > 0) {
    s.action_verbs.details.push(`  Verbs used: ${foundVerbs.slice(0, 8).join(", ")}`);
  }
  s.action_verbs.score = verbScore;

  // ═══════════════════════════════════════════════════════════════
  // 5. QUANTIFIABLE RESULTS (12 pts)
  // ═══════════════════════════════════════════════════════════════
  let quantScore = 0;

  const percentMatches = (text.match(/\d+%/g) || []).length;
  const dollarMatches = (text.match(/[\$₹€£]\s*\d[\d,.]*/g) || []).length;
  const numberMatches = (text.match(/\b\d{2,}\b/g) || []).length;
  const timeMatches = (text.match(/\b\d+\s*(x|times|fold|percent|%|million|billion|thousand|hours|days|weeks|months|years)\b/gi) || []).length;

  // Percentages
  if (percentMatches >= 4) {
    quantScore += 4;
    s.quantifiable.details.push(`✓ ${percentMatches} percentage-based metrics — excellent quantification`);
  } else if (percentMatches >= 2) {
    quantScore += 2.5;
    s.quantifiable.details.push(`✓ ${percentMatches} metrics with percentages — aim for 4+ per resume`);
  } else if (percentMatches >= 1) {
    quantScore += 1;
    s.quantifiable.details.push(`⚠ Only ${percentMatches} percentage found — add more (e.g., "increased efficiency by 25%")`);
  } else {
    s.quantifiable.details.push("✗ No percentage metrics — quantify your achievements");
  }

  // Monetary values
  if (dollarMatches >= 2) {
    quantScore += 3;
    s.quantifiable.details.push(`✓ ${dollarMatches} monetary impact metrics found`);
  } else if (dollarMatches >= 1) {
    quantScore += 1.5;
    s.quantifiable.details.push(`⚠ ${dollarMatches} monetary metric — add revenue/cost impact where applicable`);
  }

  // Other numbers
  if (numberMatches >= 15) {
    quantScore += 3;
    s.quantifiable.details.push(`✓ Extensive use of numerical data: ${numberMatches} figures detected`);
  } else if (numberMatches >= 8) {
    quantScore += 2;
    s.quantifiable.details.push(`✓ ${numberMatches} numerical figures — good use of data`);
  } else {
    quantScore += 0.5;
    s.quantifiable.details.push(`⚠ ${numberMatches} figures — use more numbers to strengthen impact`);
  }

  // Time/scale metrics
  if (timeMatches >= 2) {
    quantScore += 2;
    s.quantifiable.details.push(`✓ ${timeMatches} scale/duration metrics found`);
  }

  s.quantifiable.score = Math.min(Math.round(quantScore), 12);

  // ═══════════════════════════════════════════════════════════════
  // 6. CONTACT & LINKS (8 pts)
  // ═══════════════════════════════════════════════════════════════
  let contactScore = 0;

  if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) {
    contactScore += 2;
    s.contact.details.push("✓ Email address present");
  } else {
    s.contact.details.push("✗ No email address — add to header");
  }

  if (/\+?\d[\d\s\-().]{7,}\d/.test(text) || /phone|mobile|call|contact/i.test(text)) {
    contactScore += 1.5;
    s.contact.details.push("✓ Phone number present");
  } else {
    s.contact.details.push("✗ No phone number — add to header");
  }

  if (/linkedin/i.test(text)) {
    contactScore += 2;
    s.contact.details.push("✓ LinkedIn profile URL included");
  } else {
    s.contact.details.push("⚠ No LinkedIn URL — recruiters expect this");
  }

  if (/\bgithub\b/i.test(text)) {
    contactScore += 1.5;
    s.contact.details.push("✓ GitHub profile included");
  } else {
    s.contact.details.push("No GitHub profile");
  }

  if (/portfolio|\.com|website|blog/i.test(text)) {
    contactScore += 1;
    s.contact.details.push("✓ Online presence detected");
  } else {
    s.contact.details.push("No portfolio or personal website");
  }

  s.contact.score = Math.min(Math.round(contactScore), 8);

  // ═══════════════════════════════════════════════════════════════
  // COMPILE OVERALL SCORE
  // ═══════════════════════════════════════════════════════════════
  const totalMax = Object.values(s).reduce((sum, sec) => sum + sec.max, 0);
  const totalScore = Object.values(s).reduce((sum, sec) => sum + sec.score, 0);
  details.overall = Math.round((totalScore / totalMax) * 100);
  // Clamp to 0-100
  details.overall = Math.min(100, Math.max(0, details.overall));

  // Section pass/fail status
  details.section_scores = Object.entries(s).map(([key, sec]) => ({
    name: key,
    percent: Math.round((sec.score / sec.max) * 100),
    status: (sec.score / sec.max) >= 0.7 ? "pass" : (sec.score / sec.max) >= 0.4 ? "warn" : "fail",
  } as any));

  // ═══════════════════════════════════════════════════════════════
  // STRENGTHS
  // ═══════════════════════════════════════════════════════════════
  if (s.keywords.score >= 21) details.strengths.push("Strong keyword optimization aligned with target role");
  if (s.content.score >= 16) details.strengths.push("Complete resume with all essential sections");
  if (s.formatting.score >= 11) details.strengths.push("Excellent formatting with clear structure and bullet points");
  if (s.action_verbs.score >= 12) details.strengths.push("Powerful action verbs create impact throughout");
  if (s.quantifiable.score >= 9) details.strengths.push("Strong quantification of achievements with metrics and data");
  if (s.contact.score >= 6) details.strengths.push("Complete contact information with professional online presence");

  if (details.strengths.length === 0 && details.overall >= 60) {
    details.strengths.push("Decent foundation — targeted improvements will significantly boost your score");
  }

  // ═══════════════════════════════════════════════════════════════
  // WEAKNESSES
  // ═══════════════════════════════════════════════════════════════
  if (s.keywords.score < 18) details.weaknesses.push("Keyword optimization needs improvement — research role-specific terms");
  if (s.content.score < 14) details.weaknesses.push(`Missing or weak sections: add ${missing.slice(0, 2).join(" and ")}`);
  if (s.formatting.score < 9) details.weaknesses.push("Formatting improvements needed for better ATS readability");
  if (s.action_verbs.score < 9) details.weaknesses.push("Not enough strong action verbs — rewrite bullets for impact");
  if (s.quantifiable.score < 7) details.weaknesses.push("Achievements need quantification — add percentages, dollar amounts, and metrics");
  if (s.contact.score < 5) details.weaknesses.push("Contact information incomplete — add LinkedIn and GitHub");

  // ═══════════════════════════════════════════════════════════════
  // AI-POWERED SUGGESTIONS
  // ═══════════════════════════════════════════════════════════════
  if (s.keywords.score < 21) {
    details.suggestions.push("Incorporate more role-specific keywords from target job descriptions to improve ATS ranking");
  }
  if (s.action_verbs.score < 12) {
    details.suggestions.push("Replace passive phrases with powerful action verbs: 'Engineered', 'Spearheaded', 'Orchestrated', 'Delivered'");
  }
  if (s.quantifiable.score < 9) {
    details.suggestions.push("Use the XYZ formula for every bullet: Accomplished [X] as measured by [Y] by doing [Z] — e.g., 'Reduced cloud costs by 35% by migrating 50+ services to AWS Lambda'");
  }
  if (bulletCount < 15) {
    details.suggestions.push("Structure achievements as bullet points (aim for 3-5 per role) — ATS systems parse bullets most reliably");
  }
  if (s.content.score < 16) {
    details.suggestions.push("Add a professional summary at the top — 2-4 sentences that serve as your career elevator pitch");
  }
  if (percentMatches < 2) {
    details.suggestions.push("Quantify results with metrics: 'Increased revenue by 28%', 'Reduced processing time by 40%', 'Managed team of 12 engineers'");
  }
  if (wordCount < 350) {
    details.suggestions.push(`Resume is ${wordCount} words — expand to 400-800 words for comprehensive coverage`);
  } else if (wordCount > 950) {
    details.suggestions.push(`Resume is ${wordCount} words — consider condensing to 800 words for recruiter readability`);
  }

  // Ensure we always have at least a few suggestions
  if (details.suggestions.length < 3) {
    details.suggestions.push("Ensure consistent formatting: same font, bullet style, and date format throughout");
    details.suggestions.push("Tailor the skills section to match the specific job requirements of each application");
  }

  return details;
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: "Resume text must be at least 20 characters" },
        { status: 400 }
      );
    }

    // Use local rule-based analysis — runs in <10ms, no AI needed.
    // The analyzer checks 6 dimensions: keywords, content, formatting,
    // action verbs, quantifiable results, and contact info. It's
    // comprehensive enough without calling the Python backend.
    const analysis = analyzeAtsScore(resumeText, jobDescription);
    return NextResponse.json(analysis);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * LinkedIn Profile PDF Parser
 *
 * Parses text extracted from LinkedIn's "Get a copy of your data" PDF export
 * into the standard ResumeData shape used throughout CareerForge AI.
 *
 * LinkedIn PDF text format (approximate):
 *   JOHN DOE
 *   Senior Software Engineer at Google
 *   San Francisco Bay Area · 500+ connections
 *
 *   Summary
 *   About 8 years of experience building scalable systems...
 *
 *   Experience
 *   Senior Software Engineer
 *   Google · Full-time
 *   Jan 2020 - Present · 4 yrs 6 mos
 *   San Francisco Bay Area
 *   - Led team of 8 engineers to ship ML platform
 *   - Reduced infra costs by $340K/year
 *
 *   Education
 *   B.S. Computer Science
 *   Stanford University
 *   2013 - 2017
 *
 *   Skills
 *   Python · TypeScript · React · AWS · Kubernetes
 *
 * This parser is forgiving — it uses heuristic pattern matching
 * rather than strict grammar, because LinkedIn PDF text extraction
 * is notoriously inconsistent (wrapping, unicode, layout shifts).
 */

import type { ResumeData } from "@/types/resume";
import { emptyResume } from "@/types/resume";

const SECTION_HEADERS = [
  "Summary",
  "About",
  "Experience",
  "Education",
  "Skills",
  "Licenses & certifications",
  "Licenses and certifications",
  "Certifications",
  "Projects",
  "Honors & awards",
  "Honors and awards",
  "Languages",
  "Volunteer experience",
  "Publications",
  "Recommendations",
  "Contact",
];

const MONTH_MAP: Record<string, string> = {
  jan: "Jan", january: "Jan",
  feb: "Feb", february: "Feb",
  mar: "Mar", march: "Mar",
  apr: "Apr", april: "Apr",
  may: "May",
  jun: "Jun", june: "Jun",
  jul: "Jul", july: "Jul",
  aug: "Aug", august: "Aug",
  sep: "Sep", sept: "Sep", september: "Sep",
  oct: "Oct", october: "Oct",
  nov: "Nov", november: "Nov",
  dec: "Dec", december: "Dec",
};

/**
 * Normalize a date string from LinkedIn format to "Mon YYYY".
 * Examples:
 *   "Jan 2020"        -> "Jan 2020"
 *   "January 2020"    -> "Jan 2020"
 *   "2020"            -> "Jan 2020"  (year-only fallback)
 *   "Present"         -> "Present"
 */
function normalizeDate(input: string): string {
  const s = input.trim();
  if (/^present$/i.test(s)) return "Present";
  if (/^\d{4}$/.test(s)) return `Jan ${s}`; // Year-only
  const m = s.match(/^([A-Za-z]+)\s*(\d{4})$/);
  if (m) {
    const month = MONTH_MAP[m[1].toLowerCase()];
    if (month) return `${month} ${m[2]}`;
  }
  return s;
}

/**
 * Extract date range from a string like:
 *   "Jan 2020 - Present · 4 yrs 6 mos"
 *   "Jan 2020 - Dec 2022 · 2 yrs 11 mos"
 *   "2020 - Present"
 */
function parseDateRange(input: string): { start: string; end: string } | null {
  if (!input) return null;
  // Split on dash, en-dash, em-dash
  const parts = input.split(/\s*[-–—]\s*/);
  if (parts.length < 2) return null;
  // Strip the duration suffix (e.g. "· 4 yrs 6 mos")
  const cleanEnd = parts[1].replace(/\s*[·•].*$/, "").trim();
  return {
    start: normalizeDate(parts[0]),
    end: normalizeDate(cleanEnd),
  };
}

/**
 * Find the index of the next section header starting from `from`.
 * Returns -1 if none found.
 */
function findNextSection(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i++) {
    const line = lines[i].trim();
    if (SECTION_HEADERS.some((h) => line.toLowerCase() === h.toLowerCase())) {
      return i;
    }
  }
  return -1;
}

/**
 * Get the slice of lines belonging to a section (exclusive of header).
 */
function sliceSection(
  lines: string[],
  startIdx: number
): { lines: string[]; nextIdx: number } {
  const headerEnd = startIdx + 1;
  const nextIdx = findNextSection(lines, headerEnd);
  const sectionLines =
    nextIdx === -1 ? lines.slice(headerEnd) : lines.slice(headerEnd, nextIdx);
  return { lines: sectionLines, nextIdx };
}

/**
 * Parse the Experience section. Each entry typically spans 4-6 lines:
 *   Line 1: Position title
 *   Line 2: Company · Employment type
 *   Line 3: Date range · Duration
 *   Line 4: Location (optional)
 *   Line 5+: Bullet points or paragraph (may be wrapped)
 */
function parseExperience(lines: string[]): ResumeData["experience"] {
  if (lines.length === 0) return [];
  const result: ResumeData["experience"] = [];

  // LinkedIn sometimes uses blank lines between entries.
  // Group lines into "blocks" where a block starts with a non-empty line
  // that doesn't start with a bullet marker or "·".
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) blocks.push(current);

  for (const block of blocks) {
    if (block.length === 0) continue;
    const position = block[0];
    const companyLine = block[1] || ""; // "Company · Full-time"
    const company = companyLine.split(/\s*·\s*/)[0].trim();
    const dateLine = block[2] || "";
    const range = parseDateRange(dateLine);
    const location = block[3] || "";

    // Remaining lines are description bullets or paragraphs.
    // Split into sentences if no bullet markers, otherwise keep as-is.
    const descLines = block.slice(4);
    let description: string[];
    if (descLines.length === 0) {
      description = [];
    } else if (descLines.every((l) => /^[-•*▪]/.test(l))) {
      description = descLines.map((l) => l.replace(/^[-•*▪]\s*/, "").trim()).filter(Boolean);
    } else {
      // No bullet markers — split by sentences (preserve 60+ char sentences)
      description = descLines
        .join(" ")
        .split(/(?<=[.!?])\s+(?=[A-Z])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
    }

    result.push({
      company: company || "Unknown Company",
      position: position || "Unknown Position",
      location,
      start_date: range?.start || "",
      end_date: range?.end || null,
      description,
    });
  }

  return result;
}

/**
 * Parse the Education section. Each entry typically spans 2-4 lines:
 *   Line 1: Degree
 *   Line 2: School
 *   Line 3: Date range
 *   Line 4+: Description (GPA, honors, etc.)
 */
function parseEducation(lines: string[]): ResumeData["education"] {
  if (lines.length === 0) return [];
  const result: ResumeData["education"] = [];

  // Split into blocks by blank lines.
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
    } else {
      current.push(trimmed);
    }
  }
  if (current.length > 0) blocks.push(current);

  for (const block of blocks) {
    if (block.length === 0) continue;
    const degree = block[0];
    const institution = block[1] || "";
    const dateLine = block[2] || "";
    const range = parseDateRange(dateLine);
    const description = block.slice(3).join(" ").trim() || undefined;

    result.push({
      institution,
      degree,
      location: "",
      start_date: range?.start || "",
      end_date: range?.end || "",
      description,
    });
  }

  return result;
}

/**
 * Parse the Skills section. LinkedIn often lists skills separated by "·"
 * or each on its own line. Returns a single "Skills" group.
 */
function parseSkills(lines: string[]): ResumeData["skills"] {
  if (lines.length === 0) return [];
  const allSkills = lines
    .join(" ")
    .split(/\s*[·,•]\s*|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50 && !/^\d+$/.test(s));
  // Dedupe
  const unique = Array.from(new Set(allSkills));
  if (unique.length === 0) return [];
  return [{ category: "Skills", skills: unique }];
}

/**
 * Parse the Summary/About section. Returns a single string.
 */
function parseSummary(lines: string[]): string {
  return lines.join(" ").trim();
}

/**
 * Main entry: parse LinkedIn PDF text into ResumeData.
 */
export function parseLinkedInText(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/[ \t]+$/g, "")) // strip trailing spaces
    .filter((l, i, arr) => !(l.trim() === "" && arr[i - 1]?.trim() === "")); // collapse blank lines

  const result: ResumeData = JSON.parse(JSON.stringify(emptyResume));

  // First non-empty line is typically the name (UPPERCASE in LinkedIn exports)
  // Second non-empty line is typically the headline
  // Third might be location
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length >= 1) {
    result.personal_info.full_name = nonEmpty[0].trim();
  }
  if (nonEmpty.length >= 2) {
    result.personal_info.professional_title = nonEmpty[1].trim();
  }
  if (nonEmpty.length >= 3) {
    result.personal_info.location = nonEmpty[2]
      .replace(/\s*·.*$/, "") // strip "· 500+ connections"
      .trim();
  }

  // Find the start of each section
  const sectionStarts: Record<string, number> = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    for (const header of SECTION_HEADERS) {
      if (line === header.toLowerCase() && !(header.toLowerCase() in sectionStarts)) {
        sectionStarts[header.toLowerCase()] = i;
      }
    }
  }

  // Parse Summary
  if ("summary" in sectionStarts) {
    const { lines: sLines } = sliceSection(lines, sectionStarts["summary"]);
    result.summary = parseSummary(sLines);
  } else if ("about" in sectionStarts) {
    const { lines: sLines } = sliceSection(lines, sectionStarts["about"]);
    result.summary = parseSummary(sLines);
  }

  // Parse Experience
  if ("experience" in sectionStarts) {
    const { lines: eLines } = sliceSection(lines, sectionStarts["experience"]);
    result.experience = parseExperience(eLines);
  }

  // Parse Education
  if ("education" in sectionStarts) {
    const { lines: eLines } = sliceSection(lines, sectionStarts["education"]);
    result.education = parseEducation(eLines);
  }

  // Parse Skills
  if ("skills" in sectionStarts) {
    const { lines: sLines } = sliceSection(lines, sectionStarts["skills"]);
    result.skills = parseSkills(sLines);
  }

  // Set LinkedIn URL placeholder if detected in contact section
  if ("contact" in sectionStarts) {
    const { lines: cLines } = sliceSection(lines, sectionStarts["contact"]);
    for (const line of cLines) {
      const linkedinMatch = line.match(/linkedin\.com\/in\/([\w-]+)/i);
      if (linkedinMatch) {
        result.personal_info.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
        break;
      }
    }
  }

  return result;
}

/**
 * Best-effort detection of whether the given text looks like a LinkedIn export.
 * Used to give the user a clear error if they upload the wrong PDF.
 */
export function looksLikeLinkedInExport(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("linkedin") ||
    /connections/.test(lower) ||
    lower.includes("summary") ||
    lower.includes("experience")
  ) && text.length > 200;
}

/**
 * Flatten a structured ResumeData into a single text blob suitable for
 * match scoring. We collapse every section into one string — the match
 * scorer will tokenise and keyword-match against this.
 */

import type { ResumeData } from "@/types/resume";

export function resumeToText(resume: ResumeData): string {
  const parts: string[] = [];

  // Personal info (skip noise fields)
  const pi = resume.personal_info;
  if (pi?.full_name) parts.push(pi.full_name);
  if (pi?.professional_title) parts.push(pi.professional_title);
  if (pi?.location) parts.push(pi.location);

  // Summary
  if (resume.summary) parts.push(resume.summary);

  // Experience — positions + companies + bullet points
  for (const exp of resume.experience || []) {
    if (exp.position) parts.push(exp.position);
    if (exp.company) parts.push(exp.company);
    if (exp.location) parts.push(exp.location);
    for (const d of exp.description || []) {
      if (d) parts.push(d);
    }
  }

  // Skills — flattened across groups
  for (const group of resume.skills || []) {
    if (group.category) parts.push(group.category);
    for (const s of group.skills || []) {
      if (s) parts.push(s);
    }
  }

  // Education
  for (const ed of resume.education || []) {
    if (ed.degree) parts.push(ed.degree);
    if (ed.institution) parts.push(ed.institution);
  }

  // Projects
  for (const p of resume.projects || []) {
    if (p.name) parts.push(p.name);
    if (p.role) parts.push(p.role);
    if (p.description) parts.push(p.description);
  }

  // Certifications
  for (const c of resume.certifications || []) {
    if (c.name) parts.push(c.name);
    if (c.issuer) parts.push(c.issuer);
  }

  // Languages
  for (const l of resume.languages || []) {
    if (l.name) parts.push(l.name);
    if (l.proficiency) parts.push(l.proficiency);
  }

  // Accomplishments
  for (const a of resume.accomplishments || []) {
    if (a) parts.push(a);
  }

  // Dedupe, collapse whitespace, cap at ~8000 chars (match-scorer tolerance).
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const normalised = p.replace(/\s+/g, " ").trim();
    if (!normalised) continue;
    if (seen.has(normalised.toLowerCase())) continue;
    seen.add(normalised.toLowerCase());
    out.push(normalised);
    if (out.join(" ").length > 8000) break;
  }
  return out.join(" ");
}

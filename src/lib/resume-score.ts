import { ResumeData } from "@/types/resume";

interface ScoreSection {
  score: number;
  max: number;
  label: string;
  status: "pass" | "warn" | "fail";
}

interface ResumeScore {
  overall: number;
  sections: ScoreSection[];
  tips: string[];
}

export function calculateResumeScore(resume: ResumeData): ResumeScore {
  let totalScore = 0;
  const sections: ScoreSection[] = [];
  const tips: string[] = [];

  // 1. Personal Info (15 pts)
  let personalScore = 0;
  const p = resume.personal_info;
  if (p.full_name) personalScore += 3;
  if (p.professional_title) personalScore += 3;
  if (p.email) personalScore += 2;
  if (p.phone) personalScore += 2;
  if (p.location) personalScore += 1;
  if (p.linkedin) personalScore += 2;
  if (p.github) personalScore += 1;
  if (p.website) personalScore += 1;
  sections.push({
    score: Math.min(personalScore, 15),
    max: 15,
    label: "Contact Info",
    status: personalScore >= 12 ? "pass" : personalScore >= 7 ? "warn" : "fail",
  });
  if (!p.linkedin) tips.push("Add LinkedIn URL — recruiters expect it");
  if (!p.website) tips.push("Add portfolio/website to stand out");

  // 2. Summary (10 pts)
  let summaryScore = 0;
  const summaryWords = resume.summary.split(/\s+/).filter(Boolean).length;
  if (summaryWords >= 30) summaryScore = 10;
  else if (summaryWords >= 15) summaryScore = 7;
  else if (summaryWords >= 5) summaryScore = 4;
  else summaryScore = 0;
  sections.push({
    score: summaryScore,
    max: 10,
    label: "Summary",
    status: summaryScore >= 7 ? "pass" : summaryScore >= 4 ? "warn" : "fail",
  });
  if (summaryWords < 30) tips.push("Expand summary to 30-50 words for maximum impact");

  // 3. Experience (25 pts)
  let expScore = 0;
  const totalBullets = resume.experience.reduce((sum, exp) => sum + exp.description.filter(Boolean).length, 0);
  if (resume.experience.length >= 3) expScore += 8;
  else if (resume.experience.length >= 2) expScore += 6;
  else if (resume.experience.length >= 1) expScore += 4;
  if (totalBullets >= 15) expScore += 10;
  else if (totalBullets >= 8) expScore += 7;
  else if (totalBullets >= 4) expScore += 4;
  else if (totalBullets >= 1) expScore += 2;
  // Check for quantifiable results
  const allBullets = resume.experience.flatMap((e) => e.description);
  const hasNumbers = allBullets.some((b) => /\d+%|\$\d+|\d{2,}\+?\s*(users|customers|projects|services|people|engineers)/i.test(b));
  if (hasNumbers) expScore += 5;
  else tips.push("Add metrics to bullets: 'Increased X by 25%'");
  if (resume.experience.length === 0) tips.push("Add work experience — this is the most critical section");
  if (totalBullets < 8) tips.push("Aim for 3-5 bullet points per role");
  expScore = Math.min(expScore, 25);
  sections.push({
    score: expScore,
    max: 25,
    label: "Experience",
    status: expScore >= 18 ? "pass" : expScore >= 10 ? "warn" : "fail",
  });

  // 4. Education (10 pts)
  let eduScore = 0;
  if (resume.education.length >= 2) eduScore = 10;
  else if (resume.education.length === 1) eduScore = 7;
  sections.push({
    score: eduScore,
    max: 10,
    label: "Education",
    status: eduScore >= 7 ? "pass" : eduScore >= 4 ? "warn" : "fail",
  });
  if (resume.education.length === 0) tips.push("Add education details — required for most roles");

  // 5. Skills (15 pts)
  let skillsScore = 0;
  const totalSkills = resume.skills.reduce((sum, g) => sum + g.skills.length, 0);
  if (totalSkills >= 15) skillsScore = 10;
  else if (totalSkills >= 10) skillsScore = 8;
  else if (totalSkills >= 5) skillsScore = 5;
  else if (totalSkills >= 1) skillsScore = 3;
  if (resume.skills.length >= 3) skillsScore += 5;
  else if (resume.skills.length >= 2) skillsScore += 3;
  else if (resume.skills.length >= 1) skillsScore += 1;
  skillsScore = Math.min(skillsScore, 15);
  sections.push({
    score: skillsScore,
    max: 15,
    label: "Skills",
    status: skillsScore >= 11 ? "pass" : skillsScore >= 6 ? "warn" : "fail",
  });
  if (totalSkills < 10) tips.push("Add more skills — aim for 10-15 relevant skills");

  // 6. Projects (10 pts)
  let projectScore = 0;
  if (resume.projects.length >= 3) projectScore = 10;
  else if (resume.projects.length >= 2) projectScore = 7;
  else if (resume.projects.length >= 1) projectScore = 5;
  sections.push({
    score: projectScore,
    max: 10,
    label: "Projects",
    status: projectScore >= 7 ? "pass" : projectScore >= 4 ? "warn" : "fail",
  });
  if (resume.projects.length === 0) tips.push("Add 2-3 projects to showcase your work");

  // 7. Certifications (5 pts)
  let certScore = 0;
  if (resume.certifications.length >= 3) certScore = 5;
  else if (resume.certifications.length >= 1) certScore = 3;
  sections.push({
    score: certScore,
    max: 5,
    label: "Certifications",
    status: certScore >= 3 ? "pass" : certScore >= 1 ? "warn" : "fail",
  });

  // 8. Languages (5 pts)
  let langScore = 0;
  if (resume.languages.length >= 3) langScore = 5;
  else if (resume.languages.length >= 2) langScore = 3;
  else if (resume.languages.length >= 1) langScore = 1;
  sections.push({
    score: langScore,
    max: 5,
    label: "Languages",
    status: langScore >= 3 ? "pass" : langScore >= 1 ? "warn" : "fail",
  });

  // 9. Accomplishments (5 pts)
  let accScore = 0;
  if (resume.accomplishments.length >= 3) accScore = 5;
  else if (resume.accomplishments.length >= 1) accScore = 3;
  sections.push({
    score: accScore,
    max: 5,
    label: "Accomplishments",
    status: accScore >= 3 ? "pass" : accScore >= 1 ? "warn" : "fail",
  });
  if (resume.accomplishments.length === 0) tips.push("Add key accomplishments to stand out");

  totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const maxScore = 100;

  return {
    overall: Math.round((totalScore / maxScore) * 100),
    sections,
    tips: tips.slice(0, 5),
  };
}

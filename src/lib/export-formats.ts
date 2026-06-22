import { ResumeData } from "@/types/resume";

export function exportAsPlainText(resume: ResumeData): string {
  const p = resume.personal_info;
  const lines: string[] = [];

  // Header
  lines.push(p.full_name.toUpperCase());
  if (p.professional_title) lines.push(p.professional_title);
  
  const contactParts: string[] = [];
  if (p.email) contactParts.push(p.email);
  if (p.phone) contactParts.push(p.phone);
  if (p.location) contactParts.push(p.location);
  if (p.linkedin) contactParts.push(p.linkedin);
  if (p.github) contactParts.push(p.github);
  if (p.website) contactParts.push(p.website);
  if (contactParts.length > 0) lines.push(contactParts.join(" | "));
  
  lines.push("");
  lines.push("=".repeat(60));

  // Summary
  if (resume.summary) {
    lines.push("");
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("-".repeat(40));
    lines.push(resume.summary);
  }

  // Experience
  if (resume.experience.length > 0) {
    lines.push("");
    lines.push("PROFESSIONAL EXPERIENCE");
    lines.push("-".repeat(40));
    resume.experience.forEach((exp) => {
      lines.push("");
      lines.push(`${exp.position}`);
      lines.push(`${exp.company}, ${exp.location} | ${exp.start_date} - ${exp.end_date || "Present"}`);
      exp.description.filter(Boolean).forEach((bullet) => {
        lines.push(`  * ${bullet}`);
      });
    });
  }

  // Education
  if (resume.education.length > 0) {
    lines.push("");
    lines.push("EDUCATION");
    lines.push("-".repeat(40));
    resume.education.forEach((edu) => {
      lines.push("");
      lines.push(`${edu.degree}`);
      lines.push(`${edu.institution}, ${edu.location} | ${edu.start_date} - ${edu.end_date}`);
      if (edu.description) lines.push(`  ${edu.description}`);
    });
  }

  // Skills
  if (resume.skills.length > 0) {
    lines.push("");
    lines.push("SKILLS");
    lines.push("-".repeat(40));
    resume.skills.forEach((group) => {
      lines.push(`${group.category}: ${group.skills.join(", ")}`);
    });
  }

  // Projects
  if (resume.projects.length > 0) {
    lines.push("");
    lines.push("PROJECTS");
    lines.push("-".repeat(40));
    resume.projects.forEach((proj) => {
      lines.push("");
      lines.push(`${proj.name}${proj.role ? ` - ${proj.role}` : ""}`);
      lines.push(`  ${proj.description}`);
      if (proj.link) lines.push(`  Link: ${proj.link}`);
    });
  }

  // Certifications
  if (resume.certifications.length > 0) {
    lines.push("");
    lines.push("CERTIFICATIONS");
    lines.push("-".repeat(40));
    resume.certifications.forEach((cert) => {
      lines.push(`  ${cert.name} - ${cert.issuer} (${cert.date})`);
    });
  }

  // Languages
  if (resume.languages.length > 0) {
    lines.push("");
    lines.push("LANGUAGES");
    lines.push("-".repeat(40));
    resume.languages.forEach((lang) => {
      lines.push(`  ${lang.name} - ${lang.proficiency}`);
    });
  }

  // Accomplishments
  if (resume.accomplishments.length > 0) {
    lines.push("");
    lines.push("ACCOMPLISHMENTS");
    lines.push("-".repeat(40));
    resume.accomplishments.forEach((acc) => {
      lines.push(`  * ${acc}`);
    });
  }

  lines.push("");
  lines.push("=".repeat(60));
  lines.push(`Built with CareerForge AI`);

  return lines.join("\n");
}

export function downloadPlainText(resume: ResumeData) {
  const text = exportAsPlainText(resume);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${resume.personal_info.full_name.replace(/\s+/g, "_")}_Resume.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadAsWord(resume: ResumeData) {
  const p = resume.personal_info;
  
  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>Resume</title>
    <style>
      body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
      h1 { font-size: 22pt; color: #1a1a1a; margin-bottom: 2px; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
      h2 { font-size: 13pt; color: #4f46e5; margin-top: 18px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px; }
      h3 { font-size: 11pt; color: #1a1a1a; margin-bottom: 2px; }
      .subtitle { font-size: 12pt; color: #666; margin-bottom: 4px; }
      .contact { font-size: 10pt; color: #888; margin-bottom: 12px; }
      .job { margin-bottom: 14px; }
      .job-header { display: flex; justify-content: space-between; }
      .date { font-size: 10pt; color: #888; }
      ul { margin-top: 4px; padding-left: 20px; }
      li { font-size: 10.5pt; margin-bottom: 3px; }
      .skill-group { margin-bottom: 6px; }
      .skill-category { font-weight: bold; }
    </style></head><body>
  `;

  // Header
  html += `<h1>${p.full_name}</h1>`;
  html += `<div class="subtitle">${p.professional_title}</div>`;
  
  const contact: string[] = [];
  if (p.email) contact.push(p.email);
  if (p.phone) contact.push(p.phone);
  if (p.location) contact.push(p.location);
  if (p.linkedin) contact.push(p.linkedin);
  if (p.github) contact.push(p.github);
  if (p.website) contact.push(p.website);
  html += `<div class="contact">${contact.join(" | ")}</div>`;

  // Summary
  if (resume.summary) {
    html += `<h2>Professional Summary</h2><p>${resume.summary}</p>`;
  }

  // Experience
  if (resume.experience.length > 0) {
    html += `<h2>Professional Experience</h2>`;
    resume.experience.forEach((exp) => {
      html += `<div class="job">`;
      html += `<h3>${exp.position}</h3>`;
      html += `<div style="font-size:10pt;color:#666;">${exp.company}, ${exp.location} | ${exp.start_date} - ${exp.end_date || "Present"}</div>`;
      html += `<ul>`;
      exp.description.filter(Boolean).forEach((b) => { html += `<li>${b}</li>`; });
      html += `</ul></div>`;
    });
  }

  // Education
  if (resume.education.length > 0) {
    html += `<h2>Education</h2>`;
    resume.education.forEach((edu) => {
      html += `<div class="job">`;
      html += `<h3>${edu.degree}</h3>`;
      html += `<div style="font-size:10pt;color:#666;">${edu.institution}, ${edu.location} | ${edu.start_date} - ${edu.end_date}</div>`;
      if (edu.description) html += `<p>${edu.description}</p>`;
      html += `</div>`;
    });
  }

  // Skills
  if (resume.skills.length > 0) {
    html += `<h2>Skills</h2>`;
    resume.skills.forEach((g) => {
      html += `<div class="skill-group"><span class="skill-category">${g.category}:</span> ${g.skills.join(", ")}</div>`;
    });
  }

  // Projects
  if (resume.projects.length > 0) {
    html += `<h2>Projects</h2>`;
    resume.projects.forEach((proj) => {
      html += `<div class="job"><h3>${proj.name}${proj.role ? ` - ${proj.role}` : ""}</h3>`;
      html += `<p>${proj.description}</p>`;
      if (proj.link) html += `<p><a href="${proj.link}">${proj.link}</a></p>`;
      html += `</div>`;
    });
  }

  // Certifications
  if (resume.certifications.length > 0) {
    html += `<h2>Certifications</h2><ul>`;
    resume.certifications.forEach((c) => {
      html += `<li>${c.name} - ${c.issuer} (${c.date})</li>`;
    });
    html += `</ul>`;
  }

  // Languages
  if (resume.languages.length > 0) {
    html += `<h2>Languages</h2><p>${resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(" | ")}</p>`;
  }

  html += `</body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${p.full_name.replace(/\s+/g, "_")}_Resume.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

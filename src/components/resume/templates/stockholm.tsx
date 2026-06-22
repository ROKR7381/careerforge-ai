import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateStockholm({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm] px-10 py-8" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div className="text-center mb-6">
        {p.photo_base64 && (
          <img src={p.photo_base64} alt={p.full_name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
        )}
        <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Playfair Display, serif" }}>
          {p.full_name}
        </h1>
        <p className="text-lg text-slate-600 mt-1" style={{ fontFamily: "Playfair Display, serif" }}>
          {p.professional_title}
        </p>
        {p.power_statement && (
          <p className="text-sm text-slate-400 italic mt-2">{p.power_statement}</p>
        )}
      </div>

      {/* Contact Line */}
      <div className="text-center text-xs text-slate-500 mb-6 pb-4 border-b border-slate-200">
        {[p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean).join("  •  ") || ""}
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3">Professional Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-4 border-b border-slate-200 pb-1">
            Experience
          </h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                  <p className="text-xs text-slate-500">{exp.company}, {exp.location}</p>
                </div>
                <p className="text-xs text-slate-400 whitespace-nowrap ml-2">
                  {formatDateRange(exp.start_date, exp.end_date)}
                </p>
              </div>
              <ul className="mt-1.5 space-y-0.5">
                {exp.description.filter(Boolean).map((bullet, j) => (
                  <li key={j} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                    <span className="text-slate-300">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Accomplishments */}
      {resume.accomplishments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Accomplishments
          </h2>
          <ul className="space-y-0.5">
            {resume.accomplishments.filter(Boolean).map((acc, i) => (
              <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-2">
                <span className="text-slate-300">—</span>
                <span>{acc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-4 border-b border-slate-200 pb-1">
            Education
          </h2>
          {resume.education.map((edu, i) => (
            <div key={i} className="mb-3 flex justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                <p className="text-xs text-slate-500">{edu.institution}, {edu.location}</p>
                {edu.description && <p className="text-xs text-slate-400 mt-0.5">{edu.description}</p>}
              </div>
              <p className="text-xs text-slate-400 whitespace-nowrap ml-2">
                {formatDateRange(edu.start_date, edu.end_date)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 border-b border-slate-200 pb-1">
            Skills
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {resume.skills.map((group, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-slate-900 mb-1">{group.category}</p>
                <p className="text-xs text-slate-600">
                  {group.skills.filter(Boolean).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects + Certs + Languages */}
      <div className="grid grid-cols-2 gap-6">
        {/* Projects */}
        {resume.projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 border-b border-slate-200 pb-1">
              Projects
            </h2>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                <p className="text-xs text-slate-600">{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 border-b border-slate-200 pb-1">
                Certifications
              </h2>
              {resume.certifications.map((cert, i) => (
                <p key={i} className="text-sm text-slate-700 mb-1">{cert.name}</p>
              ))}
            </div>
          )}

          {/* Languages */}
          {resume.languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 mb-3 border-b border-slate-200 pb-1">
                Languages
              </h2>
              {resume.languages.map((lang, i) => (
                <p key={i} className="text-sm text-slate-700">
                  {lang.name} — {lang.proficiency}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

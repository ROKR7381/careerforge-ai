import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateLondon({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm] p-10 text-slate-800" style={{ fontFamily: "Georgia, serif" }}>
      {/* Centered Header */}
      <div className="text-center pb-6 border-b border-slate-300">
        <h1 className="text-3xl font-normal tracking-wide text-slate-900 mb-1">{p.full_name}</h1>
        <p className="text-sm uppercase tracking-widest text-slate-500 font-sans font-semibold mb-3">{p.professional_title}</p>
        
        {/* Centered Details Row */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-600 font-sans">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.birth_info && <span>• {p.birth_info}</span>}
          {p.nationality && <span>• {p.nationality}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
          {p.github && <span>• {p.github}</span>}
          {p.website && <span>• {p.website}</span>}
        </div>

        {p.power_statement && (
          <p className="text-xs italic text-slate-500 max-w-xl mx-auto mt-3 leading-relaxed">
            "{p.power_statement}"
          </p>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {/* Summary */}
        {resume.summary && (
          <div>
            <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 font-serif">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Employment History
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-bold text-slate-900">{exp.position}</span>
                      <span className="text-slate-500 font-serif italic"> at {exp.company}</span>
                      {exp.location && <span className="text-slate-500 font-sans text-[11px]">, {exp.location}</span>}
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans whitespace-nowrap ml-2">
                      {formatDateRange(exp.start_date, exp.end_date)}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 font-serif text-slate-700">
                    {exp.description.filter(Boolean).map((bullet, j) => (
                      <li key={j} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accomplishments */}
        {resume.accomplishments.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
              Accomplishments
            </h2>
            <ul className="list-disc pl-4 space-y-1 font-serif text-xs text-slate-700 leading-relaxed">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i}>{acc}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-3">
              Education
            </h2>
            <div className="space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i} className="text-xs flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-slate-900">{edu.degree}</span>
                    <span className="text-slate-500 italic"> — {edu.institution}</span>
                    {edu.location && <span className="text-[11px] text-slate-500 font-sans"> ({edu.location})</span>}
                    {edu.description && <p className="text-[11px] text-slate-600 mt-0.5 font-serif">{edu.description}</p>}
                  </div>
                  <span className="text-[11px] text-slate-500 font-sans whitespace-nowrap ml-2">
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column details footer */}
        <div className="grid grid-cols-2 gap-6 pt-2">
          {/* Left: Skills */}
          {resume.skills.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2.5">
                Skills
              </h2>
              <div className="space-y-2">
                {resume.skills.map((group, i) => (
                  <div key={i} className="text-[11px]">
                    <span className="font-bold text-slate-800 font-sans uppercase tracking-wider text-[10px] block mb-0.5">
                      {group.category}
                    </span>
                    <p className="text-slate-700 italic font-serif">
                      {group.skills.filter(Boolean).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right: Projects / Certifications / Languages */}
          <div className="space-y-4">
            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Certifications
                </h2>
                <div className="space-y-1.5 text-[11px]">
                  {resume.certifications.map((cert, i) => (
                    <div key={i}>
                      <span className="font-bold text-slate-800">{cert.name}</span>
                      <span className="text-slate-500 font-serif"> — {cert.issuer} ({cert.date})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {resume.languages.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Languages
                </h2>
                <div className="space-y-1 text-[11px]">
                  {resume.languages.map((lang, i) => (
                    <div key={i}>
                      <span className="font-bold text-slate-800">{lang.name}</span>
                      <span className="text-slate-500 italic"> ({lang.proficiency})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-widest font-sans font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2">
                  Key Projects
                </h2>
                <div className="space-y-2 text-[11px]">
                  {resume.projects.map((proj, i) => (
                    <div key={i}>
                      <span className="font-bold text-slate-800">{proj.name}</span>
                      {proj.role && <span className="text-slate-500 italic"> ({proj.role})</span>}
                      <p className="text-slate-600 font-serif leading-relaxed mt-0.5 text-[10.5px]">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

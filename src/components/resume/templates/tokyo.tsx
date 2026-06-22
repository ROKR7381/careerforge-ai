import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateTokyo({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Top Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500" />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{p.full_name}</h1>
            <p className="text-sm text-rose-600 font-medium mt-1">{p.professional_title}</p>
            {p.power_statement && (
              <p className="text-xs text-slate-500 italic mt-2 max-w-lg">{p.power_statement}</p>
            )}
          </div>
          {p.photo_base64 && (
            <img
              src={p.photo_base64}
              alt={p.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
            />
          )}
        </div>

        {/* Contact Row */}
        <div className="flex flex-wrap gap-4 text-xs text-slate-600 mb-6 pb-4 border-b border-slate-200">
          {p.email && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.email}</span>}
          {p.phone && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.phone}</span>}
          {p.location && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.location}</span>}
          {p.linkedin && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.linkedin}</span>}
          {p.github && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.github}</span>}
          {p.website && <span className="flex items-center gap-1"><span className="text-rose-500">●</span> {p.website}</span>}
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-rose-500" />
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            {/* Experience */}
            {resume.experience.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Experience
                </h2>
                {resume.experience.map((exp, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                        <p className="text-xs text-rose-600">{exp.company}</p>
                        <p className="text-xs text-slate-400">{exp.location}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                        {formatDateRange(exp.start_date, exp.end_date)}
                      </span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5">
                      {exp.description.filter(Boolean).map((bullet, j) => (
                        <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                          <span className="text-rose-400 mt-0.5">—</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Projects
                </h2>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                    <p className="text-xs text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Accomplishments */}
            {resume.accomplishments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Accomplishments
                </h2>
                <ul className="space-y-0.5">
                  {resume.accomplishments.filter(Boolean).map((acc, i) => (
                    <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-rose-400 mt-0.5">—</span>
                      <span>{acc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Skills */}
            {resume.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Skills
                </h2>
                {resume.skills.map((group, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-slate-800 mb-1">{group.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill, j) => (
                        <span key={j} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Education
                </h2>
                {resume.education.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-400">{formatDateRange(edu.start_date, edu.end_date)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Certifications
                </h2>
                {resume.certifications.map((cert, i) => (
                  <p key={i} className="text-xs text-slate-700 mb-1">
                    {cert.name} — {cert.issuer}
                  </p>
                ))}
              </div>
            )}

            {/* Languages */}
            {resume.languages.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Languages
                </h2>
                {resume.languages.map((lang, i) => (
                  <p key={i} className="text-xs text-slate-700">
                    {lang.name} — {lang.proficiency}
                  </p>
                ))}
              </div>
            )}

            {/* Hobbies */}
            {p.hobbies && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2 flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-rose-500" />
                  Interests
                </h2>
                <p className="text-xs text-slate-700">{p.hobbies}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

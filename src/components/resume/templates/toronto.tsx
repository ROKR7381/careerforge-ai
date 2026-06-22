import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateToronto({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Outfit, sans-serif" }}>
      {/* Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600" />

      {/* Header */}
      <div className="px-8 pt-6 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{p.full_name}</h1>
          <p className="text-lg text-indigo-600 font-medium">{p.professional_title}</p>
          {p.power_statement && (
            <p className="text-sm text-slate-500 italic mt-1 max-w-xl">{p.power_statement}</p>
          )}
        </div>
        {p.photo_base64 && (
          <img src={p.photo_base64} alt={p.full_name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
        )}
      </div>

      {/* Contact Bar */}
      <div className="px-8 pb-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>📞 {p.phone}</span>}
          {p.location && <span>📍 {p.location}</span>}
          {p.birth_info && <span>🎂 {p.birth_info}</span>}
          {p.nationality && <span>🏳 {p.nationality}</span>}
          {p.linkedin && <span>🔗 {p.linkedin}</span>}
          {p.github && <span>💻 {p.github}</span>}
          {p.website && <span>🌐 {p.website}</span>}
        </div>
      </div>

      <div className="px-8 pb-8">
        {/* Summary */}
        {resume.summary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2">Professional Summary</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
              Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{exp.position}</p>
                    <p className="text-sm text-indigo-600">{exp.company}, {exp.location}</p>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap ml-2">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </p>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-sm text-slate-700 leading-relaxed flex gap-1.5">
                      <span className="text-indigo-400 mt-1">•</span>
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2 border-b border-slate-200 pb-1">
              Accomplishments
            </h2>
            <ul className="space-y-0.5">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-sm text-slate-700 leading-relaxed flex gap-1.5">
                  <span className="text-indigo-400 mt-1">•</span>
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
              Education
            </h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-3 flex justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{edu.degree}</p>
                  <p className="text-sm text-slate-600">{edu.institution}, {edu.location}</p>
                  {edu.description && <p className="text-xs text-slate-500 mt-0.5">{edu.description}</p>}
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap ml-2">
                  {formatDateRange(edu.start_date, edu.end_date)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills + Certs + Languages Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skills */}
          {resume.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
                Skills
              </h2>
              {resume.skills.map((group, i) => (
                <div key={i} className="mb-2">
                  <p className="text-xs font-semibold text-slate-800 mb-1">{group.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.skills.filter(Boolean).map((skill, j) => (
                      <span key={j} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
                  Certifications
                </h2>
                {resume.certifications.map((cert, i) => (
                  <p key={i} className="text-sm text-slate-700 mb-1">
                    {cert.name}
                    <br />
                    <span className="text-xs text-slate-500">{cert.issuer} — {cert.date}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Languages */}
            {resume.languages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
                  Languages
                </h2>
                {resume.languages.map((lang, i) => (
                  <p key={i} className="text-sm text-slate-700">
                    {lang.name} — <span className="text-slate-500">{lang.proficiency}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3 border-b border-slate-200 pb-1">
                  Projects
                </h2>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-semibold text-slate-900">{proj.name}</p>
                    <p className="text-xs text-slate-600">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

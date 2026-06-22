import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateDublin({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex">
        {/* Sidebar */}
        <div className="w-[35%] bg-slate-800 text-white p-6 print:bg-slate-800">
          {/* Photo */}
          {p.photo_base64 && (
            <div className="text-center mb-4">
              <img
                src={p.photo_base64}
                alt={p.full_name}
                className="w-28 h-28 rounded-full object-cover mx-auto border-3 border-white/30"
              />
            </div>
          )}

          {/* Name */}
          <h1 className="text-xl font-bold mb-1">{p.full_name}</h1>
          <p className="text-sm text-slate-300 mb-4">{p.professional_title}</p>

          {p.power_statement && (
            <p className="text-xs text-slate-300 italic mb-4">{p.power_statement}</p>
          )}

          <hr className="border-slate-600 mb-4" />

          {/* Contact Details */}
          <div className="space-y-2 text-xs mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Details</h3>
            {p.location && <p>📍 {p.location}</p>}
            {p.phone && <p>📞 {p.phone}</p>}
            {p.email && <p>✉ {p.email}</p>}
            {p.birth_info && <p>🎂 {p.birth_info}</p>}
            {p.nationality && <p>🏳 {p.nationality}</p>}
            {p.linkedin && <p>🔗 {p.linkedin}</p>}
            {p.github && <p>💻 {p.github}</p>}
            {p.website && <p>🌐 {p.website}</p>}
          </div>

          <hr className="border-slate-600 mb-4" />

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Skills</h3>
              {resume.skills.map((group, i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs font-medium text-slate-300 mb-1">{group.category}</p>
                  <div className="space-y-1">
                    {group.skills.map((skill, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {resume.languages.length > 0 && (
            <div className="mb-4">
              <hr className="border-slate-600 mb-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Languages</h3>
              {resume.languages.map((lang, i) => (
                <p key={i} className="text-xs text-slate-300">
                  {lang.name} — {lang.proficiency}
                </p>
              ))}
            </div>
          )}

          {/* Hobbies */}
          {p.hobbies && (
            <div>
              <hr className="border-slate-600 mb-4" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Hobbies</h3>
              <p className="text-xs text-slate-300">{p.hobbies}</p>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-[65%] p-6">
          {/* Summary */}
          {resume.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                Employment History
              </h2>
              {resume.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{exp.position}</p>
                      <p className="text-xs text-slate-600">{exp.company}, {exp.location}</p>
                    </div>
                    <p className="text-xs text-slate-500 whitespace-nowrap ml-2">
                      {formatDateRange(exp.start_date, exp.end_date)}
                    </p>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {exp.description.filter(Boolean).map((bullet, j) => (
                      <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-1">
                        <span className="text-slate-400 mt-0.5">•</span>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-2">
                Accomplishments
              </h2>
              <ul className="space-y-0.5">
                {resume.accomplishments.filter(Boolean).map((acc, i) => (
                  <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-1">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                Education
              </h2>
              {resume.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{edu.degree}</p>
                      <p className="text-xs text-slate-600">{edu.institution}, {edu.location}</p>
                    </div>
                    <p className="text-xs text-slate-500">{formatDateRange(edu.start_date, edu.end_date)}</p>
                  </div>
                  {edu.description && (
                    <p className="text-xs text-slate-700 mt-1">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                Projects
              </h2>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-3">
                  <p className="text-sm font-bold text-slate-800">
                    {proj.name}
                    {proj.role && <span className="text-xs text-slate-500 font-normal"> — {proj.role}</span>}
                  </p>
                  <p className="text-xs text-slate-700">{proj.description}</p>
                  {proj.link && (
                    <a href={proj.link} className="text-xs text-blue-600 hover:underline">{proj.link}</a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
                Certifications
              </h2>
              {resume.certifications.map((cert, i) => (
                <p key={i} className="text-xs text-slate-700">
                  {cert.name} — {cert.issuer} ({cert.date})
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

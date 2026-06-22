import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateNewYork({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="flex">
        {/* Left Column - Photo & Contact */}
        <div className="w-[30%] bg-emerald-800 text-white p-6 print:bg-emerald-800">
          {p.photo_base64 && (
            <div className="text-center mb-6">
              <img
                src={p.photo_base64}
                alt={p.full_name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-3 border-white/30"
              />
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-xl font-bold">{p.full_name}</h1>
            <p className="text-sm text-emerald-200 mt-1">{p.professional_title}</p>
          </div>

          {p.power_statement && (
            <p className="text-xs text-emerald-100 italic mb-4 leading-relaxed">{p.power_statement}</p>
          )}

          <hr className="border-emerald-600 mb-4" />

          {/* Contact */}
          <div className="space-y-2 text-xs mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Contact</h3>
            {p.location && <p className="flex items-center gap-2"><span className="text-emerald-400">📍</span> {p.location}</p>}
            {p.phone && <p className="flex items-center gap-2"><span className="text-emerald-400">📞</span> {p.phone}</p>}
            {p.email && <p className="flex items-center gap-2"><span className="text-emerald-400">✉</span> {p.email}</p>}
            {p.linkedin && <p className="flex items-center gap-2"><span className="text-emerald-400">🔗</span> {p.linkedin}</p>}
            {p.github && <p className="flex items-center gap-2"><span className="text-emerald-400">💻</span> {p.github}</p>}
            {p.website && <p className="flex items-center gap-2"><span className="text-emerald-400">🌐</span> {p.website}</p>}
          </div>

          <hr className="border-emerald-600 mb-4" />

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Skills</h3>
              {resume.skills.map((group, i) => (
                <div key={i} className="mb-3">
                  <p className="text-xs font-medium text-emerald-200 mb-1">{group.category}</p>
                  <div className="space-y-1">
                    {group.skills.map((skill, j) => (
                      <div key={j} className="text-xs text-emerald-100">{skill}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {resume.languages.length > 0 && (
            <div className="mb-6">
              <hr className="border-emerald-600 mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Languages</h3>
              {resume.languages.map((lang, i) => (
                <p key={i} className="text-xs text-emerald-100">
                  {lang.name} — {lang.proficiency}
                </p>
              ))}
            </div>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div>
              <hr className="border-emerald-600 mb-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">Certifications</h3>
              {resume.certifications.map((cert, i) => (
                <p key={i} className="text-xs text-emerald-100 mb-1">
                  {cert.name}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="w-[70%] p-6">
          {/* Summary */}
          {resume.summary && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-3">
                Work Experience
              </h2>
              {resume.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                      <p className="text-xs text-emerald-700 font-medium">{exp.company}, {exp.location}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                      {formatDateRange(exp.start_date, exp.end_date)}
                    </span>
                  </div>
                  <ul className="mt-1 space-y-0.5">
                    {exp.description.filter(Boolean).map((bullet, j) => (
                      <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                        <span className="text-emerald-500 mt-0.5">▸</span>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-2">
                Accomplishments
              </h2>
              <ul className="space-y-0.5">
                {resume.accomplishments.filter(Boolean).map((acc, i) => (
                  <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                    <span className="text-emerald-500 mt-0.5">▸</span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-3">
                Education
              </h2>
              {resume.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-slate-600">{edu.institution}, {edu.location}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                      {formatDateRange(edu.start_date, edu.end_date)}
                    </span>
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
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-3">
                Projects
              </h2>
              {resume.projects.map((proj, i) => (
                <div key={i} className="mb-3">
                  <p className="text-sm font-bold text-slate-900">
                    {proj.name}
                    {proj.role && <span className="text-xs text-slate-500 font-normal ml-1">— {proj.role}</span>}
                  </p>
                  <p className="text-xs text-slate-700">{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Hobbies */}
          {p.hobbies && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b-2 border-emerald-800 pb-1 mb-2">
                Interests
              </h2>
              <p className="text-xs text-slate-700">{p.hobbies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateMelbourne({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header with Teal/Coral theme */}
      <div className="relative bg-gradient-to-r from-teal-600 to-cyan-500 text-white p-8">
        <div className="flex items-center gap-6">
          {p.photo_base64 && (
            <img
              src={p.photo_base64}
              alt={p.full_name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-white/30"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{p.full_name}</h1>
            <p className="text-teal-100 text-sm mt-1">{p.professional_title}</p>
            {p.power_statement && (
              <p className="text-xs text-teal-100 italic mt-2">{p.power_statement}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-teal-100">
          {p.location && <span>{p.location}</span>}
          {p.phone && <span>| {p.phone}</span>}
          {p.email && <span>| {p.email}</span>}
          {p.linkedin && <span>| {p.linkedin}</span>}
          {p.github && <span>| {p.github}</span>}
          {p.website && <span>| {p.website}</span>}
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        {resume.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Work Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-4 border-l-2 border-teal-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                    <p className="text-xs text-teal-600 font-medium">{exp.company} — {exp.location}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded whitespace-nowrap ml-2">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </span>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-coral-400 mt-0.5 text-cyan-500">▸</span>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Key Accomplishments
            </h2>
            <ul className="space-y-0.5 pl-4 border-l-2 border-teal-200">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                  <span className="text-cyan-500 mt-0.5">▸</span>
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            {/* Education */}
            {resume.education.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Education
                </h2>
                {resume.education.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    <p className="text-xs text-slate-400">{formatDateRange(edu.start_date, edu.end_date)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Certifications */}
            {resume.certifications.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
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
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Languages
                </h2>
                {resume.languages.map((lang, i) => (
                  <p key={i} className="text-xs text-slate-700">
                    {lang.name} — {lang.proficiency}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div>
            {/* Skills */}
            {resume.skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Skills
                </h2>
                {resume.skills.map((group, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-slate-800 mb-1">{group.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill, j) => (
                        <span key={j} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Projects
                </h2>
                {resume.projects.map((proj, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                    <p className="text-xs text-slate-700">{proj.description}</p>
                    {proj.link && (
                      <a href={proj.link} className="text-xs text-teal-600 hover:underline">{proj.link}</a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hobbies */}
            {p.hobbies && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
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

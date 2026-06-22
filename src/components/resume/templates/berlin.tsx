import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateBerlin({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div className="bg-slate-900 text-white p-8">
        <div className="flex items-center gap-6">
          {p.photo_base64 && (
            <img
              src={p.photo_base64}
              alt={p.full_name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-amber-400"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-wide">{p.full_name}</h1>
            <p className="text-amber-400 text-sm mt-1 font-medium">{p.professional_title}</p>
            {p.power_statement && (
              <p className="text-xs text-slate-300 italic mt-2">{p.power_statement}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-300">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Executive Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-amber-200 pb-1">
              Professional Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                    <p className="text-xs text-amber-700 font-medium">{exp.company} — {exp.location}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-amber-500 mt-0.5 font-bold">▸</span>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Key Accomplishments
            </h2>
            <ul className="space-y-1">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                  <span className="text-amber-500 mt-0.5 font-bold">▸</span>
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-amber-200 pb-1">
              Education
            </h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.institution}, {edu.location}</p>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-3 border-b border-amber-200 pb-1">
              Projects
            </h2>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-3">
                <p className="text-sm font-bold text-slate-900">
                  {proj.name}
                  {proj.role && <span className="text-xs text-slate-500 font-normal ml-1">— {proj.role}</span>}
                </p>
                <p className="text-xs text-slate-700">{proj.description}</p>
                {proj.link && (
                  <a href={proj.link} className="text-xs text-amber-600 hover:underline">{proj.link}</a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {resume.skills.map((group, i) => (
                <div key={i}>
                  <p className="text-xs font-bold text-slate-800">{group.category}</p>
                  <p className="text-xs text-slate-600">{group.skills.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Certifications
            </h2>
            <div className="space-y-1">
              {resume.certifications.map((cert, i) => (
                <p key={i} className="text-xs text-slate-700">
                  {cert.name} — {cert.issuer} ({cert.date})
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Languages
            </h2>
            <div className="flex flex-wrap gap-3">
              {resume.languages.map((lang, i) => (
                <span key={i} className="text-xs text-slate-700">
                  {lang.name} <span className="text-slate-400">({lang.proficiency})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {p.hobbies && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2 border-b border-amber-200 pb-1">
              Interests
            </h2>
            <p className="text-xs text-slate-700">{p.hobbies}</p>
          </div>
        )}
      </div>
    </div>
  );
}

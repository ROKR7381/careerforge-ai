import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateParis({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm]" style={{ fontFamily: "Georgia, serif" }}>
      <div className="p-8">
        {/* Header - Centered */}
        <div className="text-center mb-8">
          {p.photo_base64 && (
            <img
              src={p.photo_base64}
              alt={p.full_name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-slate-200"
            />
          )}
          <h1 className="text-3xl font-bold text-slate-900 tracking-wider uppercase">{p.full_name}</h1>
          <p className="text-sm text-slate-500 mt-1 tracking-wide">{p.professional_title}</p>
          {p.power_statement && (
            <p className="text-xs text-slate-400 italic mt-2 max-w-md mx-auto">{p.power_statement}</p>
          )}
          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-slate-500">
            {p.email && <span>{p.email}</span>}
            {p.email && p.phone && <span className="text-slate-300">|</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.phone && p.location && <span className="text-slate-300">|</span>}
            {p.location && <span>{p.location}</span>}
          </div>
          <div className="flex items-center justify-center gap-3 mt-1 text-xs text-slate-400">
            {p.linkedin && <span>{p.linkedin}</span>}
            {p.github && <span>{p.github}</span>}
            {p.website && <span>{p.website}</span>}
          </div>
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-px bg-slate-300" />
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-3">
              Profile
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 text-center max-w-2xl mx-auto">{resume.summary}</p>
            <div className="mt-3 flex justify-center">
              <div className="w-16 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-3">
              Professional Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                    <p className="text-xs text-slate-600 italic">{exp.company}, {exp.location}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-slate-300 mt-0.5">•</span>
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-2">
              Accomplishments
            </h2>
            <ul className="space-y-0.5 max-w-2xl mx-auto">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                  <span className="text-slate-300 mt-0.5">•</span>
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-3">
              Education
            </h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-3 text-center">
                <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                <p className="text-xs text-slate-600 italic">{edu.institution}, {edu.location}</p>
                <p className="text-xs text-slate-400">{formatDateRange(edu.start_date, edu.end_date)}</p>
                {edu.description && (
                  <p className="text-xs text-slate-700 mt-1 max-w-xl mx-auto">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-3">
              Projects
            </h2>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-3 text-center">
                <p className="text-sm font-bold text-slate-900">{proj.name}</p>
                <p className="text-xs text-slate-700 max-w-xl mx-auto">{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-3">
              Core Competencies
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {resume.skills.map((group, i) =>
                group.skills.map((skill, j) => (
                  <span key={`${i}-${j}`} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-2">
              Languages
            </h2>
            <div className="flex justify-center gap-4">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center mb-2">
              Interests
            </h2>
            <p className="text-xs text-slate-700 text-center max-w-xl mx-auto">{p.hobbies}</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

/**
 * TemplateKolkata — Traditional Indian resume style.
 *
 * Single-column, ATS-friendly. Includes typical Indian resume fields:
 * photo, date of birth, nationality, marital status, languages (prominent).
 * Centered header with bold underlined section headers. Clean serif typography.
 *
 * Optimised for Indian job boards (Naukri, Monster, Shine) and corporate ATS
 * systems that parse Hindi/Indian names and ID-style metadata correctly.
 */
export function TemplateKolkata({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div
      className="bg-white shadow-lg min-h-[297mm] px-10 py-8 text-slate-900"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      {/* Header — centered with photo, name, headline */}
      <div className="text-center mb-5 pb-4 border-b-2 border-slate-900">
        {p.photo_base64 && (
          <img
            src={p.photo_base64}
            alt={p.full_name}
            className="w-24 h-28 object-cover mx-auto mb-3 border border-slate-300"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
        )}
        <h1 className="text-3xl font-bold uppercase tracking-wider">{p.full_name}</h1>
        {p.professional_title && (
          <p className="text-base text-slate-700 mt-1 italic">{p.professional_title}</p>
        )}
        <div className="text-xs text-slate-600 mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </div>

      {/* Personal Details — Indian-standard metadata */}
      {(p.birth_info || p.nationality || p.hobbies) && (
        <div className="mb-5 text-xs text-slate-700 grid grid-cols-2 gap-x-6 gap-y-1">
          {p.birth_info && (
            <p>
              <span className="font-bold uppercase tracking-wider">Date of Birth:</span>{" "}
              {p.birth_info}
            </p>
          )}
          {p.nationality && (
            <p>
              <span className="font-bold uppercase tracking-wider">Nationality:</span>{" "}
              {p.nationality}
            </p>
          )}
          {p.hobbies && (
            <p className="col-span-2">
              <span className="font-bold uppercase tracking-wider">Hobbies:</span> {p.hobbies}
            </p>
          )}
        </div>
      )}

      {/* Summary */}
      {resume.summary && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-2">
            Career Objective
          </h2>
          <p className="text-sm leading-relaxed text-slate-800">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-3">
            Professional Experience
          </h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">
                  {exp.position} <span className="font-normal italic">— {exp.company}</span>
                </p>
                <p className="text-xs text-slate-600 whitespace-nowrap ml-2">
                  {formatDateRange(exp.start_date, exp.end_date)}
                </p>
              </div>
              {exp.location && (
                <p className="text-xs text-slate-500 italic mb-1">{exp.location}</p>
              )}
              <ul className="mt-1 space-y-0.5">
                {exp.description.filter(Boolean).map((bullet, j) => (
                  <li key={j} className="text-sm text-slate-800 leading-relaxed flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-3">
            Education
          </h2>
          {resume.education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                <p className="text-xs text-slate-600 whitespace-nowrap ml-2">
                  {formatDateRange(edu.start_date, edu.end_date)}
                </p>
              </div>
              <p className="text-xs text-slate-600">
                {edu.institution}
                {edu.location && `, ${edu.location}`}
              </p>
              {edu.description && (
                <p className="text-xs text-slate-500 italic mt-0.5">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-2">
            Skills
          </h2>
          {resume.skills.map((group, i) => (
            <p key={i} className="text-sm text-slate-800 mb-1">
              <span className="font-bold">{group.category}:</span> {group.skills.join(", ")}
            </p>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-3">
            Projects
          </h2>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm font-bold text-slate-900">
                {proj.name}
                {proj.role && <span className="font-normal italic"> — {proj.role}</span>}
              </p>
              <p className="text-xs text-slate-700">{proj.description}</p>
              {proj.link && (
                <p className="text-xs text-slate-500 italic">{proj.link}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-2">
            Certifications
          </h2>
          <ul className="space-y-0.5">
            {resume.certifications.map((cert, i) => (
              <li key={i} className="text-sm text-slate-800 flex gap-2">
                <span className="shrink-0">•</span>
                <span>
                  <span className="font-bold">{cert.name}</span> — {cert.issuer} ({cert.date})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages — emphasised for Indian market */}
      {resume.languages.length > 0 && (
        <section className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-2">
            Languages
          </h2>
          <p className="text-sm text-slate-800">
            {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join("  •  ")}
          </p>
        </section>
      )}

      {/* Accomplishments */}
      {resume.accomplishments.length > 0 && (
        <section className="mb-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] border-b border-slate-900 pb-1 mb-2">
            Key Achievements
          </h2>
          <ul className="space-y-0.5">
            {resume.accomplishments.filter(Boolean).map((acc, i) => (
              <li key={i} className="text-sm text-slate-800 flex gap-2">
                <span className="shrink-0">•</span>
                <span>{acc}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Declaration — traditional Indian resume closing */}
      <div className="mt-6 pt-3 border-t border-slate-300 text-xs text-slate-600 italic">
        I hereby declare that all the information provided above is true to the best of my knowledge and belief.
      </div>
    </div>
  );
}

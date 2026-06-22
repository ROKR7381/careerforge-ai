import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

/**
 * TemplateDelhi — Government / PSU / Banking sector resume style.
 *
 * Compact, dense single-column layout with no photo (common for Indian
 * government roles, bank PO, SSC, UPSC applications). Sans-serif throughout
 * for crisp ATS parsing. Designed to fit 2 pages of dense content.
 *
 * Sections follow the typical Indian government job application order.
 */
export function TemplateDelhi({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div
      className="bg-white shadow-lg min-h-[297mm] px-10 py-7 text-slate-900 text-[12.5px] leading-snug"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header — compact, left-aligned, no photo */}
      <div className="mb-4 pb-3 border-b-2 border-slate-900">
        <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">
          {p.full_name}
        </h1>
        {p.professional_title && (
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{p.professional_title}</p>
        )}
        <div className="text-[11px] text-slate-700 mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5">
          {p.email && (
            <p>
              <span className="font-bold">Email:</span> {p.email}
            </p>
          )}
          {p.phone && (
            <p>
              <span className="font-bold">Phone:</span> {p.phone}
            </p>
          )}
          {p.location && (
            <p>
              <span className="font-bold">Address:</span> {p.location}
            </p>
          )}
          {p.linkedin && (
            <p>
              <span className="font-bold">LinkedIn:</span> {p.linkedin}
            </p>
          )}
        </div>
      </div>

      {/* Personal Details — Indian metadata */}
      {(p.birth_info || p.nationality) && (
        <section className="mb-4 text-[11px] text-slate-800">
          <div className="grid grid-cols-3 gap-x-4 gap-y-1">
            {p.birth_info && (
              <p>
                <span className="font-bold">Date of Birth:</span> {p.birth_info}
              </p>
            )}
            {p.nationality && (
              <p>
                <span className="font-bold">Nationality:</span> {p.nationality}
              </p>
            )}
            {p.website && (
              <p>
                <span className="font-bold">Portfolio:</span> {p.website}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Summary */}
      {resume.summary && (
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Professional Summary
          </h2>
          <p className="text-[12px] leading-snug text-slate-800 px-2">{resume.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Work Experience
          </h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="mb-3 px-2">
              <div className="flex justify-between items-baseline">
                <p className="text-[12.5px] font-bold text-slate-900">
                  {exp.position} — <span className="font-medium">{exp.company}</span>
                </p>
                <p className="text-[11px] text-slate-600 whitespace-nowrap ml-2">
                  {formatDateRange(exp.start_date, exp.end_date)}
                </p>
              </div>
              {exp.location && (
                <p className="text-[11px] text-slate-500 italic">{exp.location}</p>
              )}
              <ul className="mt-1 space-y-0.5">
                {exp.description.filter(Boolean).map((bullet, j) => (
                  <li key={j} className="text-[12px] text-slate-800 leading-snug flex gap-2">
                    <span className="shrink-0">▸</span>
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
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Educational Qualifications
          </h2>
          {resume.education.map((edu, i) => (
            <div key={i} className="mb-2 px-2">
              <div className="flex justify-between items-baseline">
                <p className="text-[12.5px] font-bold text-slate-900">{edu.degree}</p>
                <p className="text-[11px] text-slate-600 whitespace-nowrap ml-2">
                  {formatDateRange(edu.start_date, edu.end_date)}
                </p>
              </div>
              <p className="text-[11.5px] text-slate-700">
                {edu.institution}
                {edu.location && `, ${edu.location}`}
              </p>
              {edu.description && (
                <p className="text-[11px] text-slate-600 italic mt-0.5">{edu.description}</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Key Skills
          </h2>
          <div className="px-2 space-y-0.5">
            {resume.skills.map((group, i) => (
              <p key={i} className="text-[12px] text-slate-800">
                <span className="font-bold">{group.category}:</span> {group.skills.join(", ")}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Projects
          </h2>
          {resume.projects.map((proj, i) => (
            <div key={i} className="mb-1.5 px-2">
              <p className="text-[12px] font-bold text-slate-900">
                {proj.name}
                {proj.role && <span className="font-normal"> — {proj.role}</span>}
              </p>
              <p className="text-[11.5px] text-slate-700">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Certifications & Training
          </h2>
          <ul className="px-2 space-y-0.5">
            {resume.certifications.map((c, i) => (
              <li key={i} className="text-[12px] text-slate-800">
                <span className="font-bold">{c.name}</span> — {c.issuer} ({c.date})
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Languages */}
      {resume.languages.length > 0 && (
        <section className="mb-2">
          <h2 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-900 mb-1 bg-slate-100 px-2 py-1">
            Languages Known
          </h2>
          <p className="text-[12px] text-slate-800 px-2">
            {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}
          </p>
        </section>
      )}

      {/* Declaration */}
      <div className="mt-4 pt-2 border-t border-slate-300 text-[10.5px] text-slate-600 italic px-2">
        Place: __________ &nbsp;&nbsp;&nbsp; Date: __________ &nbsp;&nbsp;&nbsp;{" "}
        <span className="float-right">Signature: __________</span>
      </div>
    </div>
  );
}

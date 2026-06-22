import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

/**
 * TemplateMumbai — Finance / Consulting / Banking sector resume style.
 *
 * Single-column with a bold accent bar on the left side. Reflects the
 * polished, executive style favoured in Indian financial services
 * (HDFC, ICICI, Axis Bank), consulting (McKinsey, BCG, Bain India),
 * and investment banking roles.
 *
 * Clean serif/sans pairing, strong dividers, quantified bullets emphasised.
 */
export function TemplateMumbai({ resume }: Props) {
  const { personal_info: p } = resume;
  const ACCENT = "#7c2d12"; // deep maroon/burgundy

  return (
    <div
      className="bg-white shadow-lg min-h-[297mm] flex text-slate-900"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Left accent bar */}
      <div className="w-2 shrink-0" style={{ background: ACCENT }} aria-hidden />

      <div className="flex-1 px-10 py-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b-2" style={{ borderColor: ACCENT }}>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {p.full_name}
          </h1>
          {p.professional_title && (
            <p
              className="text-base font-semibold mt-1 tracking-wide uppercase"
              style={{ color: ACCENT, fontSize: "0.95rem", letterSpacing: "0.05em" }}
            >
              {p.professional_title}
            </p>
          )}
          <div className="text-xs text-slate-600 mt-3 flex flex-wrap items-center gap-x-3 gap-y-0.5">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>· {p.phone}</span>}
            {p.location && <span>· {p.location}</span>}
            {p.linkedin && <span>· {p.linkedin}</span>}
          </div>
        </div>

        {/* Summary */}
        {resume.summary && (
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Executive Summary
            </h2>
            <p className="text-sm leading-relaxed text-slate-800">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-3 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Professional Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-bold text-slate-900">
                    {exp.position} <span className="font-medium text-slate-600">| {exp.company}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 whitespace-nowrap ml-2 font-semibold">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </p>
                </div>
                {exp.location && (
                  <p className="text-[11px] text-slate-500 italic mb-1">{exp.location}</p>
                )}
                <ul className="mt-1.5 space-y-1">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-[12.5px] text-slate-800 leading-relaxed flex gap-2.5">
                      <span
                        className="shrink-0 font-bold mt-0.5"
                        style={{ color: ACCENT }}
                      >
                        ●
                      </span>
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
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Education
            </h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                  <p className="text-[11px] text-slate-500 whitespace-nowrap ml-2">
                    {formatDateRange(edu.start_date, edu.end_date)}
                  </p>
                </div>
                <p className="text-xs text-slate-700">
                  {edu.institution}
                  {edu.location && ` · ${edu.location}`}
                </p>
                {edu.description && (
                  <p className="text-[11px] text-slate-500 italic mt-0.5">{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Key Skills */}
        {resume.skills.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {resume.skills.map((group, i) => (
                <p key={i} className="text-[12.5px] text-slate-800">
                  <span className="font-bold">{group.category}:</span>{" "}
                  {group.skills.join(", ")}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {resume.accomplishments.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Key Achievements
            </h2>
            <ul className="space-y-1">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-[12.5px] text-slate-800 flex gap-2.5">
                  <span className="shrink-0 font-bold" style={{ color: ACCENT }}>
                    ▸
                  </span>
                  <span>{acc}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section className="mb-6">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Selected Projects
            </h2>
            {resume.projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <p className="text-[13px] font-bold text-slate-900">
                  {proj.name}
                  {proj.role && <span className="font-normal italic"> · {proj.role}</span>}
                </p>
                <p className="text-[12px] text-slate-700">{proj.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <section className="mb-4">
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Certifications
            </h2>
            <ul className="space-y-0.5">
              {resume.certifications.map((c, i) => (
                <li key={i} className="text-[12px] text-slate-800">
                  <span className="font-bold">{c.name}</span> · {c.issuer} · {c.date}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <section>
            <h2
              className="text-xs font-extrabold uppercase tracking-[0.18em] mb-2 pb-1 border-b"
              style={{ color: ACCENT, borderColor: `${ACCENT}30` }}
            >
              Languages
            </h2>
            <p className="text-[12px] text-slate-800">
              {resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(" · ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

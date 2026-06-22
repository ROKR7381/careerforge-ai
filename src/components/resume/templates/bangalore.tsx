import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

/**
 * TemplateBangalore — Tech industry (IT/Software) resume style.
 *
 * Modern two-column layout with a narrow sidebar for contact + skills +
 * languages, and a wide main area for experience + education. Reflects the
 * resume style commonly used in Indian tech hubs (Bangalore, Hyderabad,
 * Pune, Gurgaon) for product companies, startups, and MNCs.
 *
 * Despite the two-column layout, sections are clearly delineated for ATS
 * parsing. Photo, location, and social links live in the sidebar.
 */
export function TemplateBangalore({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div
      className="bg-white shadow-lg min-h-[297mm] flex text-slate-900"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="w-[34%] text-white p-7"
        style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)" }}
      >
        {p.photo_base64 && (
          <img
            src={p.photo_base64}
            alt={p.full_name}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white/20"
          />
        )}
        <h1 className="text-xl font-extrabold text-center leading-tight">{p.full_name}</h1>
        {p.professional_title && (
          <p className="text-xs text-center text-indigo-200 mt-1 font-semibold">
            {p.professional_title}
          </p>
        )}

        {/* Contact */}
        <div className="mt-6 text-xs space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 border-b border-indigo-400/40 pb-1 mb-2">
            Contact
          </h3>
          {p.email && (
            <p className="break-all">
              <span className="text-indigo-300 font-bold">Email:</span>
              <br />
              {p.email}
            </p>
          )}
          {p.phone && (
            <p>
              <span className="text-indigo-300 font-bold">Phone:</span>
              <br />
              {p.phone}
            </p>
          )}
          {p.location && (
            <p>
              <span className="text-indigo-300 font-bold">Location:</span>
              <br />
              {p.location}
            </p>
          )}
          {p.linkedin && (
            <p className="break-all">
              <span className="text-indigo-300 font-bold">LinkedIn:</span>
              <br />
              <span className="text-[10.5px]">{p.linkedin}</span>
            </p>
          )}
          {p.github && (
            <p className="break-all">
              <span className="text-indigo-300 font-bold">GitHub:</span>
              <br />
              <span className="text-[10.5px]">{p.github}</span>
            </p>
          )}
        </div>

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mt-5 text-xs">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 border-b border-indigo-400/40 pb-1 mb-2">
              Skills
            </h3>
            {resume.skills.map((group, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-white text-[11px] mb-1">{group.category}</p>
                <p className="text-white/85 text-[11px] leading-relaxed">
                  {group.skills.join(" • ")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {resume.languages.length > 0 && (
          <div className="mt-5 text-xs">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 border-b border-indigo-400/40 pb-1 mb-2">
              Languages
            </h3>
            <ul className="space-y-1">
              {resume.languages.map((l, i) => (
                <li key={i} className="text-white/85 text-[11px]">
                  <span className="font-bold text-white">{l.name}</span> — {l.proficiency}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications (short list) */}
        {resume.certifications.length > 0 && (
          <div className="mt-5 text-xs">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 border-b border-indigo-400/40 pb-1 mb-2">
              Certifications
            </h3>
            <ul className="space-y-1">
              {resume.certifications.slice(0, 5).map((c, i) => (
                <li key={i} className="text-white/85 text-[11px]">
                  <span className="font-bold text-white">{c.name}</span>
                  <br />
                  <span className="text-white/70">{c.issuer} · {c.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 p-7">
        {/* Summary */}
        {resume.summary && (
          <section className="mb-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2">
              Profile
            </h2>
            <p className="text-sm leading-relaxed text-slate-800">{resume.summary}</p>
          </section>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-3">
              Experience
            </h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-bold text-slate-900">{exp.position}</p>
                  <p className="text-[11px] text-slate-500 whitespace-nowrap ml-2 font-medium">
                    {formatDateRange(exp.start_date, exp.end_date)}
                  </p>
                </div>
                <p className="text-xs text-indigo-700 font-semibold">
                  {exp.company}
                  {exp.location && ` · ${exp.location}`}
                </p>
                <ul className="mt-1.5 space-y-1">
                  {exp.description.filter(Boolean).map((bullet, j) => (
                    <li key={j} className="text-[12.5px] text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-indigo-500 shrink-0 mt-0.5">▸</span>
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
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2">
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
                <p className="text-xs text-slate-600">
                  {edu.institution}
                  {edu.location && `, ${edu.location}`}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <section className="mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2">
              Projects
            </h2>
            {resume.projects.slice(0, 4).map((proj, i) => (
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

        {/* Accomplishments */}
        {resume.accomplishments.length > 0 && (
          <section>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b-2 border-indigo-600 pb-1 mb-2">
              Key Achievements
            </h2>
            <ul className="space-y-1">
              {resume.accomplishments.filter(Boolean).map((acc, i) => (
                <li key={i} className="text-[12.5px] text-slate-700 flex gap-2">
                  <span className="text-indigo-500 shrink-0">★</span>
                  <span>{acc}</span>
              </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

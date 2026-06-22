import { ResumeData } from "@/types/resume";
import { formatDateRange } from "@/lib/utils";

interface Props {
  resume: ResumeData;
}

export function TemplateSydney({ resume }: Props) {
  const { personal_info: p } = resume;

  return (
    <div className="bg-white shadow-lg min-h-[297mm] text-slate-800 flex flex-col" style={{ fontFamily: "Outfit, sans-serif" }}>
      {/* Top Banner Header */}
      <div className="bg-[#0382ad] text-white p-8 relative overflow-hidden flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3.5xl font-extrabold tracking-tight text-white mb-1.5">{p.full_name}</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-200">{p.professional_title}</p>
          {p.power_statement && (
            <p className="text-xs text-slate-100 italic mt-2.5 max-w-xl leading-relaxed">
              "{p.power_statement}"
            </p>
          )}
        </div>

        {p.photo_base64 && (
          <img
            src={p.photo_base64}
            alt={p.full_name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white/40 shadow-lg shrink-0 ml-4"
          />
        )}
      </div>

      {/* Main Grid */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar Panel (Left) */}
        <div className="w-[32%] bg-[#02a2b8] text-white p-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/20 pb-1">
                Contact
              </h3>
              <div className="space-y-2 text-[11px] text-white/90">
                {p.email && <p className="truncate">✉ {p.email}</p>}
                {p.phone && <p>📞 {p.phone}</p>}
                {p.location && <p>📍 {p.location}</p>}
                {p.birth_info && <p>🎂 {p.birth_info}</p>}
                {p.nationality && <p>🏳 {p.nationality}</p>}
                {p.linkedin && <p className="truncate">🔗 {p.linkedin}</p>}
                {p.github && <p className="truncate">💻 {p.github}</p>}
                {p.website && <p className="truncate">🌐 {p.website}</p>}
              </div>
            </div>

            {/* Skills */}
            {resume.skills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/20 pb-1">
                  Skills
                </h3>
                {resume.skills.map((group, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {group.category}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.filter(Boolean).map((skill, j) => (
                        <span key={j} className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {resume.languages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/20 pb-1">
                  Languages
                </h3>
                <div className="space-y-1.5">
                  {resume.languages.map((lang, i) => (
                    <div key={i} className="text-[11px] text-white/90">
                      <p className="font-semibold text-white">{lang.name}</p>
                      <p className="text-[10px] text-white/70 uppercase font-medium">{lang.proficiency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {p.hobbies && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 border-b border-white/20 pb-1">
                  Hobbies
                </h3>
                <p className="text-[11px] text-white/90 leading-relaxed">{p.hobbies}</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Body (Right) */}
        <div className="w-[68%] p-6 space-y-6 overflow-y-auto">
          {/* Summary */}
          {resume.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-2">
                About Me
              </h2>
              <p className="text-xs leading-relaxed text-slate-600">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-3">
                Professional History
              </h2>
              <div className="relative pl-4 border-l border-slate-200 ml-1.5 space-y-4">
                {resume.experience.map((exp, i) => (
                  <div key={i} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#02a2b8] border border-white shadow-sm" />
                    
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{exp.position}</p>
                        <p className="text-[11px] text-[#02a2b8] font-semibold">{exp.company}, {exp.location}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatDateRange(exp.start_date, exp.end_date)}
                      </p>
                    </div>
                    <ul className="mt-1 space-y-1">
                      {exp.description.filter(Boolean).map((bullet, j) => (
                        <li key={j} className="text-xs text-slate-600 leading-relaxed flex gap-1.5">
                          <span className="text-[#02a2b8] mt-1">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accomplishments */}
          {resume.accomplishments.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-2.5">
                Accomplishments
              </h2>
              <ul className="space-y-1">
                {resume.accomplishments.filter(Boolean).map((acc, i) => (
                  <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-1.5">
                    <span className="text-[#02a2b8] mt-1">•</span>
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-3">
                Education
              </h2>
              <div className="relative pl-4 border-l border-slate-200 ml-1.5 space-y-4">
                {resume.education.map((edu, i) => (
                  <div key={i} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#02a2b8] border border-white shadow-sm" />
                    
                    <div className="flex justify-between items-baseline">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{edu.degree}</p>
                        <p className="text-[11px] text-slate-500">{edu.institution}, {edu.location}</p>
                        {edu.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatDateRange(edu.start_date, edu.end_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-3">
                Featured Projects
              </h2>
              <div className="relative pl-4 border-l border-slate-200 ml-1.5 space-y-4">
                {resume.projects.map((proj, i) => (
                  <div key={i} className="relative text-xs">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-[#02a2b8] border border-white shadow-sm" />
                    
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">
                        {proj.name}
                        {proj.role && <span className="text-[11px] text-slate-400 font-normal"> — {proj.role}</span>}
                      </p>
                      {proj.link && (
                        <a href={proj.link} className="text-[10px] text-[#02a2b8] hover:underline">Link</a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resume.certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#02a2b8] border-b border-slate-200 pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-1.5 text-xs text-slate-600">
                {resume.certifications.map((cert, i) => (
                  <div key={i} className="flex justify-between">
                    <span><strong>{cert.name}</strong> — {cert.issuer}</span>
                    <span className="text-[10px] text-slate-400">{cert.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

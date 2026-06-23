"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/visual/glass-card";
import type { ResumeData } from "@/types/resume";

interface PreviewStepProps {
  initialResume: ResumeData;
  onBack: () => void;
  onConfirm: (resume: ResumeData) => void;
}

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "About", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
] as const;

export function PreviewStep({ initialResume, onBack, onConfirm }: PreviewStepProps) {
  const [resume, setResume] = useState<ResumeData>(initialResume);
  const [activeSection, setActiveSection] = useState<typeof SECTIONS[number]["id"]>("personal");

  function update<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  function updatePersonal<K extends keyof ResumeData["personal_info"]>(
    key: K,
    value: ResumeData["personal_info"][K]
  ) {
    setResume((r) => ({ ...r, personal_info: { ...r.personal_info, [key]: value } }));
  }

  return (
    <div className="space-y-6">
      <GlassCard intensity="default" className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Review extracted data
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Edit any field that doesn&apos;t look right, then continue to optimize.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            <Sparkles className="h-3.5 w-3.5" />
            Auto-parsed from LinkedIn
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-border">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === "personal" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={resume.personal_info.full_name}
                  onChange={(e) => updatePersonal("full_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="professional_title">Headline</Label>
                <Input
                  id="professional_title"
                  value={resume.personal_info.professional_title}
                  onChange={(e) => updatePersonal("professional_title", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resume.personal_info.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resume.personal_info.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resume.personal_info.location}
                  onChange={(e) => updatePersonal("location", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={resume.personal_info.linkedin || ""}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/your-handle"
                />
              </div>
            </div>
          )}

          {activeSection === "summary" && (
            <div className="space-y-2">
              <Label htmlFor="summary">Professional summary</Label>
              <Textarea
                id="summary"
                value={resume.summary}
                onChange={(e) => update("summary", e.target.value)}
                rows={8}
                placeholder="Your About section from LinkedIn…"
              />
              <p className="text-xs text-muted-foreground">
                {resume.summary.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          )}

          {activeSection === "experience" && (
            <div className="space-y-4">
              {resume.experience.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No experience found in your LinkedIn PDF.
                </p>
              )}
              {resume.experience.map((exp, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border bg-white/60 space-y-3"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Position</Label>
                      <Input
                        value={exp.position}
                        onChange={(e) => {
                          const next = [...resume.experience];
                          next[i] = { ...exp, position: e.target.value };
                          update("experience", next);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => {
                          const next = [...resume.experience];
                          next[i] = { ...exp, company: e.target.value };
                          update("experience", next);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Start date</Label>
                      <Input
                        value={exp.start_date}
                        onChange={(e) => {
                          const next = [...resume.experience];
                          next[i] = { ...exp, start_date: e.target.value };
                          update("experience", next);
                        }}
                        placeholder="Jan 2020"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End date</Label>
                      <Input
                        value={exp.end_date || ""}
                        onChange={(e) => {
                          const next = [...resume.experience];
                          next[i] = { ...exp, end_date: e.target.value || null };
                          update("experience", next);
                        }}
                        placeholder="Present"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bullets (one per line)</Label>
                    <Textarea
                      value={exp.description.join("\n")}
                      onChange={(e) => {
                        const next = [...resume.experience];
                        next[i] = {
                          ...exp,
                          description: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        };
                        update("experience", next);
                      }}
                      rows={Math.max(3, exp.description.length + 1)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "education" && (
            <div className="space-y-3">
              {resume.education.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No education found in your LinkedIn PDF.
                </p>
              )}
              {resume.education.map((edu, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border bg-white/60 grid gap-3 sm:grid-cols-2"
                >
                  <div className="space-y-1.5">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const next = [...resume.education];
                        next[i] = { ...edu, degree: e.target.value };
                        update("education", next);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const next = [...resume.education];
                        next[i] = { ...edu, institution: e.target.value };
                        update("education", next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "skills" && (
            <div className="space-y-2">
              <Label>Skills (comma-separated)</Label>
              <Textarea
                value={resume.skills.flatMap((g) => g.skills).join(", ")}
                onChange={(e) => {
                  const skills = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  update("skills", skills.length > 0 ? [{ category: "Skills", skills }] : []);
                }}
                rows={4}
              />
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button variant="ghost" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => onConfirm(resume)} className="w-full sm:w-auto h-12 px-8 shadow-lg shadow-primary/25 cursor-glow">
            Looks good — optimize with AI
            <Sparkles className="ml-2 h-4 w-4" />
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

(PreviewStep as unknown as { icon: typeof FileText }).icon = FileText;

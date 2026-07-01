"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  Save,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  Loader2,
  FileText,
  Plus,
  Trash2,
  Printer,
  Share2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ResumeData,
  emptyResume,
  TemplateName,
  WorkExperience,
  Education,
  SkillGroup,
  Project,
  Certification,
  Language,
} from "@/types/resume";
import { ResumePreview } from "@/components/resume/preview";
import { ResumeScoreWidget } from "@/components/resume/resume-score-widget";
import { downloadPlainText, downloadAsWord } from "@/lib/export-formats";
import { downloadResumePdf, estimatePageCount } from "@/lib/pdf-export";
import { ResumePDF } from "@/components/resume/ResumePDF";
import { ResumeFormPersonalInfo } from "@/components/resume/form-personal-info";
import { ResumeFormExperience } from "@/components/resume/form-experience";
import { ResumeFormEducation } from "@/components/resume/form-education";
import { ResumeFormSkills } from "@/components/resume/form-skills";
import { ResumeFormProjects } from "@/components/resume/form-projects";
import { ResumeFormCertifications } from "@/components/resume/form-certifications";
import { ResumeFormLanguages } from "@/components/resume/form-languages";
import { sampleResume } from "@/types/sample-resume";

// All available resume templates. Centralised so the toolbar, preview, and ATS pages stay in sync.
const TEMPLATE_NAMES: TemplateName[] = [
  "dublin", "toronto", "stockholm", "london", "sydney",
  "berlin", "tokyo", "newyork", "paris", "melbourne",
  // Indian ATS-friendly templates
  "kolkata", "delhi", "bangalore", "mumbai",
];

interface ResumeBuilderClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string | null;
  };
  initialResume: any | null;
  resumeId: string | null;
  resumes: Array<{
    id: string;
    title: string;
    templateName: string;
    updatedAt: Date;
  }>;
}

export function ResumeBuilderClient({
  user,
  initialResume,
  resumeId,
  resumes,
}: ResumeBuilderClientProps) {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData>(
    initialResume || emptyResume
  );
  const [currentId, setCurrentId] = useState<string | null>(resumeId);
  const [template, setTemplate] = useState<TemplateName>(() => {
    if (initialResume) {
      return (resumes.find((r) => r.id === resumeId)?.templateName || "dublin") as TemplateName;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTemplate = params.get("template") as TemplateName;
      if (urlTemplate && TEMPLATE_NAMES.includes(urlTemplate)) {
        return urlTemplate;
      }
    }
    return "dublin";
  });
  const [showPreview, setShowPreview] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [activeSection, setActiveSection] = useState("personal-info");
  const [pageCount, setPageCount] = useState(1);
  const [title, setTitle] = useState(
    initialResume
      ? resumes.find((r) => r.id === resumeId)?.title || "Untitled Resume"
      : "Untitled Resume"
  );
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  // Recompute estimated page count whenever resume content or template changes.
  // Small delay so the DOM has time to update with the new template first.
  useEffect(() => {
    if (!showPreview) {
      setPageCount(1);
      return;
    }
    const t = setTimeout(() => {
      try {
        setPageCount(estimatePageCount("resume-preview"));
      } catch {
        setPageCount(1);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [resume, template, showPreview]);

  // Auto-save
  const saveResume = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      const body = {
        title,
        templateName: template,
        resumeJson: resume,
      };

      let res;
      if (currentId) {
        res = await fetch(`/api/resumes/${currentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (!currentId) {
          setCurrentId(data.resume.id);
          router.replace(`/builder?id=${data.resume.id}`, { scroll: false });
        }
      }
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false);
    }
  }, [resume, title, template, currentId, user, router]);

  // Load sample data if URL query parameter is set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("sample") && !initialResume) {
        setResume(sampleResume);
        toast.success("Sample resume loaded dynamically!");
        // Clear param from URL so it doesn't reload on every mount
        window.history.replaceState({}, "", "/builder");
      }
    }
  }, [initialResume]);

  // Debounced auto-save every 3 seconds
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      saveResume();
    }, 3000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [resume, title, template, saveResume]);

  const updateResume = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
      setResume((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleShareLink = useCallback(() => {
    if (!currentId) return;
    const shareUrl = `${window.location.origin}/share/${currentId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  }, [currentId]);

  const fetchSuggestions = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      if (!res.ok) throw new Error("Failed to scan resume");
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      toast.success("AI resume scan complete!");
    } catch (e) {
      toast.error("Failed to run AI scan. Verify the Python backend is running.");
    } finally {
      setScanning(false);
    }
  };

  const applySuggestion = (s: any) => {
    setResume((prev) => {
      const updated = { ...prev };
      if (s.section === "personal_info") {
        if (updated.personal_info) {
          (updated.personal_info as any)[s.key] = s.suggested;
        }
      } else if (s.section === "summary") {
        updated.summary = s.suggested;
      } else if (s.section === "experience" && s.index !== null) {
        if (updated.experience && updated.experience[s.index]) {
          if (s.bullet_index !== null) {
            const bullets = [...updated.experience[s.index].description];
            bullets[s.bullet_index] = s.suggested;
            updated.experience[s.index] = {
              ...updated.experience[s.index],
              description: bullets,
            };
          } else {
            (updated.experience[s.index] as any)[s.key] = s.suggested;
          }
        }
      } else if (s.section === "skills" && s.index !== null) {
        if (updated.skills && updated.skills[s.index]) {
          if (s.key === "skills") {
            updated.skills[s.index] = {
              ...updated.skills[s.index],
              skills: Array.isArray(s.suggested) ? s.suggested : s.suggested.split(",").map((x: string) => x.trim()),
            };
          } else {
            (updated.skills[s.index] as any)[s.key] = s.suggested;
          }
        }
      } else if (s.section === "projects" && s.index !== null) {
        if (updated.projects && updated.projects[s.index]) {
          if (s.key === "description") {
            updated.projects[s.index] = {
              ...updated.projects[s.index],
              description: Array.isArray(s.suggested) ? s.suggested : [s.suggested],
            };
          } else {
            (updated.projects[s.index] as any)[s.key] = s.suggested;
          }
        }
      } else if (s.section === "certifications" && s.index !== null) {
        if (updated.certifications && updated.certifications[s.index]) {
          (updated.certifications[s.index] as any)[s.key] = s.suggested;
        }
      } else if (s.section === "languages" && s.index !== null) {
        if (updated.languages && updated.languages[s.index]) {
          (updated.languages[s.index] as any)[s.key] = s.suggested;
        }
      } else if (s.section === "accomplishments" && s.index !== null) {
        if (updated.accomplishments) {
          const accs = [...updated.accomplishments];
          accs[s.index] = s.suggested;
          updated.accomplishments = accs;
        }
      }
      return updated;
    });
    toast.success(`Applied AI suggestion: "${s.title}"`);
    setSuggestions((prev) => prev.filter((item) => item !== s));
  };

  const sections = [
    { id: "personal-info", label: "Personal Info" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
    { id: "languages", label: "Languages" },
    { id: "accomplishments", label: "Accomplishments" },
    { id: "resume-score", label: "📊 Score" },
    { id: "ai-insights", label: "✨ AI Insights" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel — Form Editor */}
      <div
        className={`${
          showPreview ? "w-[42%]" : "w-full"
        } overflow-y-auto border-r border-white/20 bg-white/70 backdrop-blur-xl shadow-hd no-print`}
      >
        {/* Toolbar */}
        <div className="sticky top-0 z-10 glass border-b border-white/20 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 w-48 text-sm font-medium border-0 bg-transparent px-1 focus-visible:ring-0"
                placeholder="Resume Title"
              />
              {saving && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={user.subscriptionPlan === "FREE" ? "secondary" : "success"}
                className="text-xs"
              >
                {user.subscriptionPlan === "FREE" ? "Free" : "Premium"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates((v) => !v)}
              aria-expanded={showTemplates}
              aria-controls="template-picker"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {showTemplates ? (
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
              )}
              Templates ({TEMPLATE_NAMES.length})
            </Button>
            {showTemplates && (
              <div
                id="template-picker"
                className="contents"
                role="group"
                aria-label="Resume templates"
              >
                {TEMPLATE_NAMES.map((t) => (
                  <Button
                    key={t}
                    variant={template === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTemplate(t)}
                    className="capitalize text-xs"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            )}
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <EyeOff className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Eye className="h-3.5 w-3.5 mr-1" />
              )}
              Preview
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={saveResume}
              disabled={saving}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
            {currentId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareLink}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                <Share2 className="h-3.5 w-3.5 mr-1" />
                Share
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResume(sampleResume);
                toast.success("Sample resume loaded");
              }}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Load Sample
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAiOptimize()}
              disabled={aiOptimizing}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {aiOptimizing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1" />
              )}
              AI Optimize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAiEnhance()}
              disabled={aiOptimizing}
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {aiOptimizing ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1" />
              )}
              Enhance with AI
            </Button>
          </div>
        </div>

        {/* Form Sections */}
        <div className="p-4 space-y-6">
          {/* Section Navigation */}
          <div className="flex gap-1 flex-wrap">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Separator />

          {/* Personal Info */}
          {activeSection === "personal-info" && (
            <ResumeFormPersonalInfo
              info={resume.personal_info}
              onChange={(info) => updateResume("personal_info", info)}
            />
          )}

          {/* Summary */}
          {activeSection === "summary" && (
            <div className="space-y-2">
              <Label>Professional Summary</Label>
              <Textarea
                value={resume.summary}
                onChange={(e) => updateResume("summary", e.target.value)}
                placeholder="Write a compelling 2-4 sentence professional summary..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Highlight your key strengths, years of experience, and career goals.
              </p>
            </div>
          )}

          {/* Experience */}
          {activeSection === "experience" && (
            <ResumeFormExperience
              experience={resume.experience}
              onChange={(exp) => updateResume("experience", exp)}
            />
          )}

          {/* Education */}
          {activeSection === "education" && (
            <ResumeFormEducation
              education={resume.education}
              onChange={(edu) => updateResume("education", edu)}
            />
          )}

          {/* Skills */}
          {activeSection === "skills" && (
            <ResumeFormSkills
              skills={resume.skills}
              onChange={(skills) => updateResume("skills", skills)}
            />
          )}

          {/* Projects */}
          {activeSection === "projects" && (
            <ResumeFormProjects
              projects={resume.projects}
              onChange={(projects) => updateResume("projects", projects)}
            />
          )}

          {/* Certifications */}
          {activeSection === "certifications" && (
            <ResumeFormCertifications
              certifications={resume.certifications}
              onChange={(certs) => updateResume("certifications", certs)}
            />
          )}

          {/* Languages */}
          {activeSection === "languages" && (
            <ResumeFormLanguages
              languages={resume.languages}
              onChange={(langs) => updateResume("languages", langs)}
            />
          )}

          {/* Accomplishments */}
          {activeSection === "accomplishments" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Accomplishments</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateResume("accomplishments", [
                      ...resume.accomplishments,
                      "",
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
              {resume.accomplishments.map((acc, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={acc}
                    onChange={(e) => {
                      const newAccs = [...resume.accomplishments];
                      newAccs[i] = e.target.value;
                      updateResume("accomplishments", newAccs);
                    }}
                    placeholder="Describe a notable accomplishment..."
                    className="min-h-[60px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newAccs = resume.accomplishments.filter(
                        (_, j) => j !== i
                      );
                      updateResume("accomplishments", newAccs);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {activeSection === "ai-insights" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">AI Resume Insights</h3>
                  <p className="text-xs text-muted-foreground">
                    Get detailed suggestions to improve impact, clarity, and ATS score.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={fetchSuggestions}
                  disabled={scanning}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Scan Resume
                    </>
                  )}
                </Button>
              </div>

              {suggestions.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-8 text-center bg-slate-50/50">
                  <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-medium text-slate-800">No suggestions loaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                    Click "Scan Resume" to run a deep AI analysis and generate structural improvements.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      We found <strong>{suggestions.length}</strong> improvements. Review and apply them directly to update your resume instantly.
                    </span>
                  </div>

                  <div className="space-y-3">
                    {suggestions.map((s, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-white space-y-2.5 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="max-w-[70%]">
                            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {s.section}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-900 mt-1">{s.title}</h4>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 text-xs shrink-0 py-1 h-7 animate-pulse hover:animate-none"
                            onClick={() => applySuggestion(s)}
                          >
                            Apply Change
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border border-slate-100">
                          {s.reason}
                        </p>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          {s.original && (
                            <div className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-800">
                              <span className="font-semibold block text-[10px] text-rose-600 uppercase mb-0.5">Original</span>
                              <span className="line-through">{s.original}</span>
                            </div>
                          )}
                          <div className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-800">
                            <span className="font-semibold block text-[10px] text-emerald-600 uppercase mb-0.5">Suggested</span>
                            <span>{Array.isArray(s.suggested) ? s.suggested.join(", ") : s.suggested}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resume Score Widget */}
        {activeSection === "resume-score" && (
          <ResumeScoreWidget resume={resume} />
        )}
      </div>

      {/* Right Panel — Live HD Preview */}
      {showPreview && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between no-print">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Live HD Preview
              </span>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportPdf()}
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportHtml()}
              >
                <Download className="h-3.5 w-3.5 mr-1" /> HTML
              </Button>
              <PDFDownloadLink
                document={<ResumePDF data={resume} />}
                fileName={`${resume.personal_info.full_name || "resume"}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="default" size="sm" disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-vibrant hover:shadow-vibrant hover:scale-[1.02] active:scale-95 transition-all">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {loading ? "Processing HD PDF..." : "HD PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadWord}
                title={
                  user.subscriptionPlan === "FREE"
                    ? "Pro feature — unlock from ₹249"
                    : "Download as Word"
                }
              >
                <FileText className="h-3.5 w-3.5 mr-1" /> Word
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTxt}
                title="Plain text — always free"
              >
                <Download className="h-3.5 w-3.5 mr-1" /> TXT
              </Button>
            </div>
          </div>

          <div className="mx-auto" style={{ maxWidth: "210mm" }}>
            <ResumePreview resume={resume} template={template} />
          </div>
        </div>
      )}
    </div>
  );

  async function handleAiOptimize() {
    setAiOptimizing(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          instructions:
            "Improve this resume to be more impactful. Use strong action verbs, quantify achievements with the XYZ formula, and organize skills into logical groups.",
        }),
      });
      if (!res.ok) throw new Error("Optimization failed");
      const data = await res.json();
      setResume(data.resume || data);
      toast.success("Resume optimized by AI!");
    } catch {
      toast.error("AI optimization failed. Make sure the Python backend is running.");
    } finally {
      setAiOptimizing(false);
    }
  }

  async function handleAiEnhance() {
    setAiOptimizing(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          instructions:
            "Rewrite this resume to be more impactful and ATS-optimized. Use strong action verbs, quantify achievements with the XYZ formula, organize skills into logical groups, and ensure all sections are complete.",
        }),
      });
      if (!res.ok) throw new Error("Enhancement failed");
      const data = await res.json();
      const enhancedResume = data.resume || data;

      // Save as new resume
      const saveRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${title} (Enhanced)`,
          templateName: template,
          resumeJson: enhancedResume,
        }),
      });
      if (!saveRes.ok) throw new Error("Save failed");
      const saved = await saveRes.json();

      toast.success("Resume enhanced! Opening enhanced copy...");
      window.location.href = `/builder?id=${saved.resume.id}`;
    } catch {
      toast.error("Enhancement failed. Make sure the Python backend is running.");
    } finally {
      setAiOptimizing(false);
    }
  }

  async function handleExportHtml() {
    if (!requirePaidPlan("download your resume as HTML")) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          templateName: template,
          format: "html",
        }),
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();

      // Open in new tab for printing
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(data.html);
        newWindow.document.close();
      }
    } catch {
      toast.error("Export failed. Make sure the Python backend is running.");
    }
  }

  async function handleExportPdf() {
    if (!requirePaidPlan("download your resume as PDF")) return;
    try {
      // We use the browser's native print engine to produce the PDF — this
      // sidesteps html2canvas's inability to parse modern CSS color
      // functions (lab / oklch / lch / color) that Tailwind v4 emits.
      // The user picks "Save as PDF" in the print dialog to get the file.
      toast.info("Opening print dialog — pick “Save as PDF” as the destination.", {
        description: "Chromium, Safari and Firefox all support this. The PDF will match the screen preview 1:1.",
        duration: 6000,
      });
      await downloadResumePdf({
        elementId: "resume-preview",
        filename: title || "Resume",
      });
    } catch (err: any) {
      console.error("PDF export failed:", err);
      toast.error(err?.message || "PDF export failed. Try the Print button.");
    }
  }

  // ------------------------------------------------------------------
  // Plan gating helper
  // ------------------------------------------------------------------
  // Free users can build, edit, and preview their resume — but every
  // download surface (PDF, Word, Excel, HTML) and gated feature (LinkedIn
  // import, Smart Job Search save, full ATS report) routes through here.
  // We surface a high-intent upgrade CTA pointing to the ₹249 trial
  // because that's the lowest friction paid tier.
  function requirePaidPlan(action: string): boolean {
    if (user.subscriptionPlan !== "FREE") return true;
    toast.error(
      `${action[0].toUpperCase()}${action.slice(1)} is a Pro feature.`,
      {
        description:
          "Start a 7-day Pro trial for just ₹249 — no auto-charge, cancel anytime.",
        action: {
          label: "Unlock from ₹249",
          onClick: () => {
            window.location.href = "/billing?plan=TRIAL";
          },
        },
        duration: 8000,
      }
    );
    return false;
  }

  // Expose the gating helper so JSX-level handlers can use it without
  // having to inline the same toast logic in every onClick.
  function handleDownloadWord() {
    if (!requirePaidPlan("download your resume as Word")) return;
    downloadAsWord(resume);
  }

  // Free users can still export plain text — it's just the underlying data,
  // not a branded output. This gives free users something tangible without
  // cannibalising the paid download funnel (PDF / Word / Excel).
  function handleDownloadTxt() {
    downloadPlainText(resume);
  }
}

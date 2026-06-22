"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Sparkles, Loader2, FileText, Target, CheckCircle,
  AlertTriangle, Lightbulb, RefreshCw, BarChart3, Search, Zap,
  Gauge, BookOpen, Download, Printer, ExternalLink, Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ResumePreview } from "@/components/resume/preview";
import type { ResumeData, TemplateName } from "@/types/resume";

interface AtsScoreResult {
  overall: number;
  sections: Record<string, { score: number; max: number; details: string[] }>;
  strengths: string[];
  weaknesses: string[];
  missing_sections: string[];
  suggestions: string[];
}

interface Props {
  user: { id: string; email: string; name: string | null; subscriptionPlan: string; subscriptionStatus: string | null };
}

const sectionConfig = [
  { key: "keywords", label: "Keyword Optimization", icon: Search, color: "text-blue-500" },
  { key: "formatting", label: "Formatting & Structure", icon: BarChart3, color: "text-purple-500" },
  { key: "content", label: "Content Completeness", icon: FileText, color: "text-emerald-500" },
  { key: "action_verbs", label: "Action Verbs", icon: Zap, color: "text-amber-500" },
  { key: "quantifiable", label: "Quantifiable Results", icon: Gauge, color: "text-rose-500" },
  { key: "contact", label: "Contact & Links", icon: BookOpen, color: "text-cyan-500" },
];

export function AtsClient({ user }: Props) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedResume, setEnhancedResume] = useState<ResumeData | null>(null);
  const [enhancedId, setEnhancedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateName>("dublin");
  const [streamingText, setStreamingText] = useState("");
  const [streamingPhase, setStreamingPhase] = useState<"idle" | "streaming" | "parsing" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsingFile, setParsingFile] = useState(false);

  async function scanResume() {
    if (!resumeText || resumeText.trim().length < 20) {
      toast.error("Please paste at least 20 characters of resume content");
      return;
    }
    setLoading(true);
    setResult(null);
    setEnhancedResume(null);
    setEnhancedId(null);
    try {
      const res = await fetch("/api/ats/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
      return;
    }

    setParsingFile(true);
    const toastId = toast.loading(`Loading ${file.name}...`);
    try {
      let text = "";

      if (file.name.toLowerCase().endsWith(".pdf")) {
        // Parse PDF entirely in the browser — pdfjs-dist needs all the
        // browser APIs (DOMMatrix, Canvas) that aren't available in Node.js.
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: any) => item.str).join(" "));
        }
        text = pages.join("\n").trim();
      } else if (file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")) {
        // Parse DOCX in the browser with mammoth
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = (result.value || "").trim();
      }

      if (!text) throw new Error("Failed to extract text from file. The file may be empty or image-based.");

      setResumeText(text);
      toast.success(`Loaded ${file.name}`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to parse file: ${err.message}`, { id: toastId });
    } finally {
      setParsingFile(false);
      if (e.target) e.target.value = "";
    }
  }

  async function enhanceWithResumeAI() {
    if (!result) return;
    setEnhancing(true);
    setStreamingPhase("streaming");
    setEnhancedResume(null);
    setEnhancedId(null);

    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
        throw new Error(errData.detail || errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      const enhanced = data.resume;

      if (!enhanced || !enhanced.personal_info) {
        throw new Error("Invalid response from AI");
      }

      setStreamingPhase("parsing");

      // Save to DB
      const saveRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "ATS Enhanced Resume",
          templateName: "dublin",
          resumeJson: enhanced,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save enhanced resume");
      const saved = await saveRes.json();

      setEnhancedResume(enhanced);
      setEnhancedId(saved.resume.id);
      setStreamingPhase("done");
      toast.success("Resume enhanced! Preview below.");
    } catch (err: any) {
      toast.error(err.message || "Enhancement failed. Make sure the Python backend is running.");
      setStreamingPhase("idle");
    } finally {
      setEnhancing(false);
    }
  }

  function handlePrintPdf() {
    window.print();
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  }

  function getScoreLabel(score: number): string {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Work";
    return "Poor";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ATS Score Analyzer</h1>
            <p className="text-muted-foreground">
              Scan your resume, get a score, then enhance it with AI and download
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Input + Score */}
        <div className="space-y-6">
          {/* Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-2 border-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" /> Resume Input
                </CardTitle>
                <CardDescription>Paste or upload your resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  onClick={() => !parsingFile && fileRef.current?.click()} 
                  className={`rounded-lg border-2 border-dashed border-border p-5 text-center transition-colors ${
                    parsingFile 
                      ? "cursor-not-allowed bg-emerald-50/10 border-emerald-300" 
                      : "cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30"
                  }`}
                >
                  <input ref={fileRef} type="file" accept=".txt,.docx,.doc,.pdf" onChange={handleFileUpload} className="hidden" disabled={parsingFile} />
                  {parsingFile ? (
                    <>
                      <Loader2 className="mx-auto h-7 w-7 text-emerald-500 animate-spin mb-2" />
                      <p className="text-sm font-medium text-emerald-500">Loading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-7 w-7 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Upload resume file</p>
                      <p className="text-xs text-muted-foreground mt-1">TXT, DOCX, DOC, PDF</p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Paste Resume Content</Label>
                  <Textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your full resume here..." className="min-h-[180px] font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-500" /> Job Description <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description for keyword matching..." className="min-h-[80px]" />
                </div>
                <Button onClick={scanResume} disabled={loading || resumeText.trim().length < 20} size="lg" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                  {loading ? "Scanning..." : "Analyze ATS Score"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Score Results + Enhance Button */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Score Card */}
                <Card className="overflow-hidden border-2 border-emerald-500/10">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-1" />
                  <CardContent className="p-5">
                    <div className="flex items-center gap-5">
                      <div className="relative shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle cx="50" cy="50" r="42" fill="none"
                            stroke={result.overall >= 80 ? "#22c55e" : result.overall >= 60 ? "#f59e0b" : "#ef4444"}
                            strokeWidth="8" strokeDasharray={`${(result.overall / 100) * 264} 264`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <span className={`text-2xl font-bold ${getScoreColor(result.overall)}`}>{result.overall}</span>
                            <span className="text-xs text-muted-foreground block">/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold">ATS Score</h2>
                          <Badge variant={result.overall >= 70 ? "success" : result.overall >= 50 ? "warning" : "destructive"} className="text-xs">{getScoreLabel(result.overall)}</Badge>
                        </div>
                        <Button onClick={enhanceWithResumeAI} disabled={enhancing} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 mt-2">
                          {enhancing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
                          {enhancing ? "Enhancing..." : "Enhance with ResumeAI"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {sectionConfig.map((sec) => {
                      const section = result.sections[sec.key];
                      if (!section) return null;
                      const pct = Math.round((section.score / section.max) * 100);
                      const Icon = sec.icon;
                      return (
                        <div key={sec.key}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <Icon className={`h-3.5 w-3.5 ${sec.color}`} />
                              <span className="text-xs font-medium">{sec.label}</span>
                            </div>
                            <span className={`text-xs font-bold ${getScoreColor(pct)}`}>{section.score}/{section.max}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Strengths + Weaknesses compact */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.strengths.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Strengths</CardTitle></CardHeader>
                      <CardContent><ul className="space-y-0.5">{result.strengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-green-500">✓</span>{s}</li>)}</ul></CardContent>
                    </Card>
                  )}
                  {result.weaknesses.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Improve</CardTitle></CardHeader>
                      <CardContent><ul className="space-y-0.5">{result.weaknesses.map((w, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-amber-500">→</span>{w}</li>)}</ul></CardContent>
                    </Card>
                  )}
                </div>

                {/* Suggestions */}
                {result.suggestions.length > 0 && (
                  <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs flex items-center gap-1"><Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Suggestions</CardTitle></CardHeader>
                    <CardContent><ul className="space-y-1">{result.suggestions.map((sg, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1"><span className="text-emerald-500 font-bold">{i + 1}.</span>{sg}</li>)}</ul></CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Enhanced Resume Preview */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {streamingPhase === "streaming" ? (
            <Card className="h-full border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/30 to-teal-50/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
                  <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-emerald-400/20" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ResumeAI is enhancing...</h3>
                <div className="space-y-1 max-w-sm">
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                  <p className="text-sm text-muted-foreground">Analyzing and rewriting your resume for maximum ATS impact</p>
                </div>
              </CardContent>
            </Card>
          ) : streamingPhase === "parsing" ? (
            <Card className="h-full border-2 border-emerald-500/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
                <h3 className="text-lg font-semibold mb-1">Parsing enhanced resume...</h3>
                <p className="text-sm text-muted-foreground">Almost there!</p>
              </CardContent>
            </Card>
          ) : !enhancedResume ? (
            <Card className="h-full border-2 border-dashed border-border">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                  <Wand2 className="h-14 w-14 text-emerald-300" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Enhanced Resume Preview</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload your resume and click "Enhance with ResumeAI" to see the ATS-optimized version here with download options.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Download Bar */}
              <Card className="border-2 border-emerald-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-emerald-500" />
                      <span className="font-semibold text-sm">Enhanced Resume Ready</span>
                      <Badge variant="success" className="text-xs">ATS Optimized</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {(["dublin", "toronto", "stockholm", "london", "sydney"] as TemplateName[]).map((t) => (
                        <Button key={t} variant={previewTemplate === t ? "default" : "outline"} size="sm" onClick={() => setPreviewTemplate(t)} className="capitalize text-xs px-2">{t}</Button>
                      ))}
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Button size="sm" onClick={handlePrintPdf}>
                      <Printer className="h-4 w-4 mr-1" /> Print / Save PDF
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/builder?id=${enhancedId}`} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4 mr-1" /> Open in Builder
                      </a>
                    </Button>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs">
                    <span className="font-bold">💡 Tip:</span> This resume is auto-enhanced by AI. For absolute control over layout, styling, and sections, we highly recommend opening it in our full interactive <a href={`/builder?id=${enhancedId}`} className="underline font-bold text-emerald-900 hover:text-emerald-950">Resume Builder</a>!
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="max-h-[800px] overflow-y-auto p-4 print:p-0">
                  <div className="mx-auto" style={{ maxWidth: "210mm" }}>
                    <ResumePreview resume={enhancedResume} template={previewTemplate} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Print styles for ATS page */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #ats-print-area, #ats-print-area * { visibility: visible; }
          #ats-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

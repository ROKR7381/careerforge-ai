"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Save,
  CheckCircle2,
  ArrowRight,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/visual/glass-card";
import { toast } from "sonner";
import type { ResumeData } from "@/types/resume";

interface OptimizeStepProps {
  resume: ResumeData;
  optimizedResume: ResumeData | null;
  onOptimized: (resume: ResumeData) => void;
  onBack: () => void;
  onSaved: () => void;
  user: { id: string; subscriptionPlan: string };
}

export function OptimizeStep({
  resume,
  optimizedResume,
  onOptimized,
  onBack,
  onSaved,
  user,
}: OptimizeStepProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  const isPro = user.subscriptionPlan !== "FREE";

  async function runOptimize() {
    setLoading(true);
    try {
      const res = await fetch("/api/linkedin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Optimization failed");
      }
      const data = await res.json();
      onOptimized(data.optimized);
      setUsedFallback(!!data._fallback);
      toast.success("Profile optimized!");
    } catch (e: any) {
      toast.error(e.message || "Optimization failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveToDashboard() {
    if (!optimizedResume) return;
    setSaving(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${optimizedResume.personal_info.full_name || "Untitled"} — LinkedIn Import`,
          templateName: "dublin",
          resumeJson: optimizedResume,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save");
      }
      toast.success("Resume saved to your dashboard!");
      setTimeout(() => onSaved(), 800);
    } catch (e: any) {
      toast.error(e.message || "Failed to save resume");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero card — triggers optimization */}
      <GlassCard intensity="default" glow className="p-8 sm:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-300/40 mb-4">
          <Wand2 className="h-7 w-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {optimizedResume ? "Your optimized profile" : "Ready to optimize"}
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          {optimizedResume
            ? "Review the side-by-side comparison below, then save to your dashboard."
            : "Our AI will rewrite your headline, About, and experience bullets to be more impactful, ATS-friendly, and keyword-rich."}
        </p>

        {!optimizedResume && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={runOptimize}
              disabled={loading}
              className="h-12 px-8 shadow-lg shadow-primary/25 cursor-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize with AI
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={onBack} size="lg" className="h-12">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit data
            </Button>
          </div>
        )}

        {!isPro && optimizedResume && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Free tier: 1 LinkedIn optimization. Upgrade to Professional for unlimited.
          </div>
        )}
      </GlassCard>

      {/* Fallback warning */}
      {usedFallback && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Using basic optimization</p>
            <p className="text-amber-800 mt-1">
              Our Python AI backend isn&apos;t running, so we applied rule-based
              improvements. Start it with{" "}
              <code className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs">
                cd python-backend && uvicorn main:app --reload
              </code>{" "}
              for full AI rewrites.
            </p>
          </div>
        </div>
      )}

      {/* Comparison view */}
      {optimizedResume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Headline comparison */}
          <ComparisonCard
            title="Headline"
            before={resume.personal_info.professional_title}
            after={optimizedResume.personal_info.professional_title}
            changed={resume.personal_info.professional_title !== optimizedResume.personal_info.professional_title}
          />

          {/* Summary comparison */}
          <ComparisonCard
            title="About / Summary"
            before={resume.summary}
            after={optimizedResume.summary}
            changed={resume.summary !== optimizedResume.summary}
            multiline
          />

          {/* Experience comparisons */}
          {optimizedResume.experience.map((optExp, i) => {
            const origExp = resume.experience[i];
            if (!origExp) return null;
            const bulletsChanged = JSON.stringify(origExp.description) !== JSON.stringify(optExp.description);
            return (
              <div key={i} className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Experience: {optExp.position} at {optExp.company}
                  {bulletsChanged && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      AI Enhanced
                    </span>
                  )}
                </h3>
                {bulletsChanged && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-slate-50/60 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Before
                      </p>
                      <ul className="space-y-1.5 text-sm text-slate-600">
                        {origExp.description.map((b, j) => (
                          <li key={j} className="leading-relaxed">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4 relative">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        After (Optimized)
                      </p>
                      <ul className="space-y-1.5 text-sm text-slate-800 font-medium">
                        {optExp.description.map((b, j) => (
                          <li key={j} className="leading-relaxed">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Save actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border">
            <Button variant="ghost" onClick={onBack} className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Edit data
            </Button>
            <Button
              onClick={saveToDashboard}
              disabled={saving}
              size="lg"
              className="w-full sm:w-auto h-12 px-8 shadow-lg shadow-primary/25 cursor-glow"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ComparisonCard({
  title,
  before,
  after,
  changed,
  multiline = false,
}: {
  title: string;
  before: string;
  after: string;
  changed: boolean;
  multiline?: boolean;
}) {
  if (!changed) {
    return (
      <GlassCard intensity="subtle" className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {title}
        </p>
        <p className="text-sm text-slate-700">{before || <em className="text-muted-foreground">(empty)</em>}</p>
        <p className="text-xs text-muted-foreground mt-2">No changes needed</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        {title}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          AI Enhanced
        </span>
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-slate-50/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Before
          </p>
          <p className={`text-sm text-slate-600 ${multiline ? "whitespace-pre-wrap" : ""}`}>
            {before || <em className="text-muted-foreground">(empty)</em>}
          </p>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            After (Optimized)
          </p>
          <p className={`text-sm text-slate-800 font-medium ${multiline ? "whitespace-pre-wrap" : ""}`}>
            {after}
          </p>
        </div>
      </div>
    </div>
  );
}

(OptimizeStep as unknown as { icon: typeof Sparkles }).icon = Sparkles;

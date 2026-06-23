"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadStep } from "@/components/linkedin/upload-step";
import { PreviewStep } from "@/components/linkedin/preview-step";
import { OptimizeStep } from "@/components/linkedin/optimize-step";
import type { ResumeData } from "@/types/resume";
import { Sparkles, FileCheck, Upload as UploadIcon, FileText } from "lucide-react";

type Step = "upload" | "preview" | "optimize";

interface LinkedInClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionPlan: string;
  };
}

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "upload", label: "Upload" },
  { id: "preview", label: "Review" },
  { id: "optimize", label: "Optimize" },
];

function StepIcon({ id, className }: { id: Step; className?: string }) {
  if (id === "upload") return <UploadIcon className={className} />;
  if (id === "preview") return <FileCheck className={className} />;
  return <Sparkles className={className} />;
}

export function LinkedInClient({ user }: LinkedInClientProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);

  function reset() {
    setStep("upload");
    setParsedResume(null);
    setOptimizedResume(null);
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-300/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-fuchsia-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
            <svg
              className="h-3.5 w-3.5 fill-current"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn Optimizer · Beta
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Turn your <span className="gradient-text">LinkedIn</span> into an ATS-ready resume
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your LinkedIn Data Export PDF and our AI will parse, polish, and
            optimize every section — headline, About, experience bullets — in under 60 seconds.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isComplete =
                (s.id === "upload" && (step === "preview" || step === "optimize")) ||
                (s.id === "preview" && step === "optimize");

              return (
                <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                        isComplete
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-300/40"
                          : isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <StepIcon id={s.id} className="h-4 w-4" />
                    </div>
                    <span
                      className={`hidden sm:inline text-sm font-semibold ${
                        isActive || isComplete ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 w-8 sm:w-16 transition-colors ${
                        isComplete ? "bg-emerald-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === "upload" && (
              <UploadStep
                onParsed={(resume) => {
                  setParsedResume(resume);
                  setStep("preview");
                }}
              />
            )}
            {step === "preview" && parsedResume && (
              <PreviewStep
                initialResume={parsedResume}
                onBack={() => setStep("upload")}
                onConfirm={(resume) => {
                  setParsedResume(resume);
                  setStep("optimize");
                }}
              />
            )}
            {step === "optimize" && parsedResume && (
              <OptimizeStep
                resume={parsedResume}
                optimizedResume={optimizedResume}
                onOptimized={setOptimizedResume}
                onBack={() => setStep("preview")}
                onSaved={reset}
                user={user}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Trust footer */}
        <div className="mt-12 text-center text-xs text-muted-foreground">
          🔒 Your LinkedIn data is encrypted in transit and at rest. We never share
          your personal information.{" "}
          <a href="/privacy" className="underline hover:text-foreground">
            Privacy policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}

// Avoid unused-import warning for FileText (kept for type parity)
void FileText;

"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/visual/glass-card";
import type { ResumeData } from "@/types/resume";

interface UploadStepProps {
  onParsed: (resume: ResumeData) => void;
}

export function UploadStep({ onParsed }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (selected: File) => {
    setError(null);
    const lower = selected.name.toLowerCase();
    if (!lower.endsWith(".pdf") && !lower.endsWith(".docx") && !lower.endsWith(".txt")) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File too large. Max 10 MB.");
      return;
    }
    setFile(selected);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  async function parseAndContinue() {
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      // Step 1: extract text using existing /api/parse
      const fd = new FormData();
      fd.append("file", file);
      const parseRes = await fetch("/api/parse", { method: "POST", body: fd });
      if (!parseRes.ok) {
        const e = await parseRes.json().catch(() => ({}));
        throw new Error(e.error || "Failed to read file");
      }
      const { text } = await parseRes.json();
      if (!text || text.length < 50) {
        throw new Error("Could not extract any text. The PDF may be scanned/image-based.");
      }

      // Step 2: parse LinkedIn structure
      const importRes = await fetch("/api/linkedin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!importRes.ok) {
        const e = await importRes.json().catch(() => ({}));
        throw new Error(e.error || "Failed to parse LinkedIn profile");
      }
      const { resume } = await importRes.json();
      onParsed(resume);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard intensity="default" glow className="p-8 sm:p-10">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`relative border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : file
              ? "border-emerald-300 bg-emerald-50/40"
              : "border-slate-300 bg-slate-50/40 hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            aria-label="Upload LinkedIn profile PDF"
          />

          {file ? (
            <div
              className="flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(1)} KB · Ready to parse
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setError(null);
                  inputRef.current?.click();
                }}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center gap-4 pointer-events-none"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-300/40">
                <Upload className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  Drop your LinkedIn profile here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or{" "}
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="font-semibold text-primary hover:underline"
                  >
                    browse files
                  </button>{" "}
                  · PDF, DOCX, or TXT · max 10 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
          >
            How do I export my LinkedIn profile?
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showHelp ? "rotate-180" : ""}`}
            />
          </button>
          <Button
            size="lg"
            onClick={parseAndContinue}
            disabled={!file || parsing}
            className="w-full sm:w-auto h-12 px-8 shadow-lg shadow-primary/25 cursor-glow"
          >
            {parsing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing your profile…
              </>
            ) : (
              <>
                Continue
                <FileText className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </GlassCard>

      {/* Help section */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <GlassCard intensity="subtle" className="p-6">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Export your LinkedIn profile in 60 seconds
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-slate-700 shrink-0">1.</span>
                <span>
                  Go to{" "}
                  <a
                    href="https://www.linkedin.com/settings/data-export"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    linkedin.com/settings/data-export
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-slate-700 shrink-0">2.</span>
                <span>
                  Select <strong>"Want something in particular?"</strong> → check{" "}
                  <strong>Profile</strong> (and optionally <strong>Positions</strong>,{" "}
                  <strong>Education</strong>, <strong>Skills</strong>).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-slate-700 shrink-0">3.</span>
                <span>
                  Click <strong>Request archive</strong>. LinkedIn emails you a download
                  link within ~10 minutes.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-slate-700 shrink-0">4.</span>
                <span>
                  Download the ZIP, extract it, and upload the{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                    Profile.pdf
                  </code>{" "}
                  file above.
                </span>
              </li>
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              <strong>Privacy:</strong> Your file is processed securely and never
              shared with third parties. We don't store your LinkedIn data after
              parsing.
            </p>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}

UploadStep.icon = Upload;

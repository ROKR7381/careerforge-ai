"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Loader2,
  Target,
  Sparkles,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface MatchResult {
  overall_score: number;
  keyword_matches: string[];
  missing_keywords: string[];
  skill_gaps: string[];
  suggestions: string[];
  strengths: string[];
}

export function JobsClient({ user }: { user: { id: string; email: string; name: string | null; subscriptionPlan: string; subscriptionStatus: string | null } }) {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyzeMatch() {
    if (!jobDescription || !resumeText) {
      toast.error("Please provide both resume content and a job description");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/match-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: { summary: resumeText },
          job_description: jobDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatchResult(data);
    } catch {
      toast.error("Match analysis requires the Python backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Discovery & AI Matcher</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your resume against any job description and get a detailed match score.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Resume vs Job Description
              </CardTitle>
              <CardDescription>
                Paste your resume content and the target job description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Resume Content</Label>
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text, summary, or key skills..."
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[150px]"
                />
              </div>
              <Button
                onClick={analyzeMatch}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Match
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {!matchResult ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter your resume and a job description, then click "Analyze Match" to see your score.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Overall Score */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-3">
                    <span className="text-2xl font-bold text-white">{matchResult.overall_score}</span>
                  </div>
                  <h2 className="text-lg font-bold">Match Score</h2>
                  <p className="text-xs text-muted-foreground">
                    {matchResult.overall_score >= 70
                      ? "Strong match!"
                      : matchResult.overall_score >= 50
                      ? "Moderate match — some gaps to fill"
                      : "Low match — significant gaps detected"}
                  </p>
                </CardContent>
              </Card>

              {/* Strengths */}
              {matchResult.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" /> Matched Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.keyword_matches.map((kw, i) => (
                        <Badge key={i} variant="success" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Missing Skills */}
              {matchResult.missing_keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" /> Missing Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.missing_keywords.map((kw, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Skill Gaps */}
              {matchResult.skill_gaps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" /> Skill Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {matchResult.skill_gaps.map((gap, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-amber-500">→</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {matchResult.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {matchResult.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

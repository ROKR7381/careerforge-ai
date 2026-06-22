"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Star,
  TrendingUp,
  Target,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReportCardProps {
  score: number;
  questionsAsked: number;
  questionsTotal: number;
  evaluations: Array<{
    score: number;
    clarity: number;
    correctness: number;
    depth: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
  }>;
  onRestart: () => void;
}

export function ReportCard({
  score,
  questionsAsked,
  questionsTotal,
  evaluations,
  onRestart,
}: ReportCardProps) {
  const avgClarity = evaluations.reduce((s, e) => s + e.clarity, 0) / evaluations.length;
  const avgCorrectness = evaluations.reduce((s, e) => s + e.correctness, 0) / evaluations.length;
  const avgDepth = evaluations.reduce((s, e) => s + e.depth, 0) / evaluations.length;

  const allStrengths = [...new Set(evaluations.flatMap((e) => e.strengths))];
  const allWeaknesses = [...new Set(evaluations.flatMap((e) => e.weaknesses))];

  const grade = score >= 8 ? "Excellent" : score >= 6 ? "Good" : score >= 4 ? "Fair" : "Needs Practice";
  const gradeColor = score >= 8 ? "text-green-500" : score >= 6 ? "text-blue-500" : score >= 4 ? "text-amber-500" : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
            <span className="text-4xl font-bold text-white">{Math.round(score * 10)}</span>
          </div>
          <h2 className={`text-2xl font-bold ${gradeColor}`}>{grade}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {questionsAsked} of {questionsTotal} questions answered
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" /> Clarity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClarity.toFixed(1)}</div>
            <Progress value={avgClarity * 10} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" /> Correctness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCorrectness.toFixed(1)}</div>
            <Progress value={avgCorrectness * 10} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-500" /> Depth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDepth.toFixed(1)}</div>
            <Progress value={avgDepth * 10} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-green-500" /> Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allStrengths.length > 0 ? (
              <ul className="space-y-1">
                {allStrengths.slice(0, 5).map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-green-500 shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths recorded</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" /> Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allWeaknesses.length > 0 ? (
              <ul className="space-y-1">
                {allWeaknesses.slice(0, 5).map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-amber-500 shrink-0">→</span> {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No improvements needed</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" /> Summary
          </h3>
          <p className="text-sm text-muted-foreground">
            You answered {questionsAsked} questions with an average score of {score.toFixed(1)}/10.
            {score >= 7
              ? " Great job! You're well-prepared."
              : score >= 5
              ? " Solid effort. Focus on the areas above to improve."
              : " Keep practicing — consistent effort will improve your scores."}
          </p>
        </CardContent>
      </Card>

      <Button onClick={onRestart} className="w-full" variant="outline" size="lg">
        <RefreshCw className="mr-2 h-4 w-4" /> Practice Again
      </Button>
    </motion.div>
  );
}

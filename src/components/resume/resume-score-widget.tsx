"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ResumeData } from "@/types/resume";
import { calculateResumeScore } from "@/lib/resume-score";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Lightbulb,
  Target,
} from "lucide-react";

interface Props {
  resume: ResumeData;
}

export function ResumeScoreWidget({ resume }: Props) {
  const score = useMemo(() => calculateResumeScore(resume), [resume]);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  const scoreColor =
    score.overall >= 80
      ? "text-green-500"
      : score.overall >= 60
      ? "text-amber-500"
      : score.overall >= 40
      ? "text-orange-500"
      : "text-red-500";

  const scoreLabel =
    score.overall >= 80
      ? "Excellent"
      : score.overall >= 60
      ? "Good"
      : score.overall >= 40
      ? "Needs Work"
      : "Incomplete";

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case "warn":
        return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
    }
  };

  return (
    <Card className="border-2 border-border shadow-sm">
      <CardContent className="p-5">
        {/* Score Circle */}
        <div className="flex items-center gap-5 mb-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/30"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={scoreColor}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {score.overall}
              </span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Resume Score</span>
            </div>
            <Badge
              variant={score.overall >= 80 ? "default" : "secondary"}
              className={`mb-2 ${
                score.overall >= 80
                  ? "bg-green-100 text-green-700 border-green-200"
                  : score.overall >= 60
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {scoreLabel}
            </Badge>
            <p className="text-xs text-muted-foreground">
              {score.overall >= 80
                ? "Your resume is well-optimized!"
                : score.overall >= 60
                ? "Good progress, a few improvements needed"
                : "Add more content to boost your score"}
            </p>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="space-y-2 mb-5">
          {score.sections.map((section) => (
            <div key={section.label} className="flex items-center gap-2">
              {statusIcon(section.status)}
              <span className="text-xs flex-1 truncate">{section.label}</span>
              <div className="w-20 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    section.status === "pass"
                      ? "bg-green-500"
                      : section.status === "warn"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${(section.score / section.max) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right">
                {section.score}/{section.max}
              </span>
            </div>
          ))}
        </div>

        {/* Tips */}
        {score.tips.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold">Quick Wins</span>
            </div>
            <ul className="space-y-1.5">
              {score.tips.map((tip, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex gap-1.5">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

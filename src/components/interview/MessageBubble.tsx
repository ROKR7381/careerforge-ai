"use client";

import { Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MessageBubbleProps {
  role: "user" | "bot";
  content: string;
  evaluation?: {
    score: number;
    clarity: number;
    correctness: number;
    depth: number;
    strengths: string[];
    weaknesses: string[];
    suggestion: string;
  } | null;
}

export function MessageBubble({ role, content, evaluation }: MessageBubbleProps) {
  const [showEval, setShowEval] = useState(false);
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-foreground" />
        )}
      </div>

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm"
          )}
        >
          {content}
        </div>

        {evaluation && (
          <>
            <button
              onClick={() => setShowEval(!showEval)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showEval ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Score: {evaluation.score}/10
            </button>

            {showEval && (
              <Card className="p-3 text-xs space-y-2 w-full bg-muted/50">
                <div className="flex gap-3 flex-wrap">
                  <span>Clarity: {evaluation.clarity}/10</span>
                  <span>Correctness: {evaluation.correctness}/10</span>
                  <span>Depth: {evaluation.depth}/10</span>
                </div>
                {evaluation.strengths.length > 0 && (
                  <div>
                    <span className="font-medium text-green-600">Strengths:</span>
                    <ul className="list-disc list-inside ml-1">
                      {evaluation.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.weaknesses.length > 0 && (
                  <div>
                    <span className="font-medium text-amber-600">Improve:</span>
                    <ul className="list-disc list-inside ml-1">
                      {evaluation.weaknesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {evaluation.suggestion && (
                  <p className="text-muted-foreground">{evaluation.suggestion}</p>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

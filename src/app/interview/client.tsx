"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  ChevronRight,
  BarChart3,
  Clock,
  Target,
  MessageSquare,
  RefreshCw,
  Star,
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
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Question {
  id: number;
  type: "behavioral" | "technical" | "cultural";
  question: string;
  focus_area: string;
  tips: string;
}

interface Answer {
  questionId: number;
  answer: string;
}

interface Feedback {
  overall_score: number;
  scores: { relevance: number; clarity: number; technical_depth: number; active_language: number; star_format: number };
  question_scores: Array<{ question_id: number; score: number; strengths: string; improvements: string; suggested_answer_hint: string }>;
  strengths: string[];
  areas_for_improvement: string[];
  actionable_advice: string;
}

interface Props {
  user: { id: string; email: string; name: string | null; subscriptionPlan: string; subscriptionStatus: string | null };
}

export function InterviewClient({ user }: Props) {
  const [step, setStep] = useState<"setup" | "questions" | "feedback">("setup");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  async function startInterview() {
    if (!jobTitle) {
      toast.error("Please enter a job title");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_title: jobTitle, job_description: jobDescription, resume: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
      setStep("questions");
    } catch {
      toast.error("Failed to generate questions. Make sure the Python backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function submitAnswer() {
    if (!currentAnswer.trim()) return;
    setAnswers([...answers, { questionId: questions[currentQ].id, answer: currentAnswer }]);
    setCurrentAnswer("");

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitFeedback();
    }
  }

  async function submitFeedback() {
    setFeedbackLoading(true);
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobTitle,
          resume: {},
          questions,
          answers: answers.map((a) => ({ questionId: a.questionId, answer: a.answer })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback(data);
      setStep("feedback");
    } catch {
      toast.error("Failed to generate feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  function reset() {
    setStep("setup");
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setCurrentAnswer("");
    setFeedback(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Interview Prep</h1>
        <p className="mt-1 text-muted-foreground">
          Practice with AI-generated questions tailored to your target role.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Setup Step */}
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Configure Your Interview
                </CardTitle>
                <CardDescription>
                  Tell us about your target role and we&apos;ll generate customized questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Job Title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Description (Optional)</Label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description to get more tailored questions..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={startInterview}
                  disabled={loading || !jobTitle}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Interview Questions
                </Button>
              </CardContent>
            </Card>

            {user.subscriptionPlan === "FREE" && (
              <Card className="mt-4 bg-amber-50 border-amber-200">
                <CardContent className="p-4 text-sm text-amber-800">
                  <p className="font-medium">Free tier includes 3 questions per session.</p>
                  <p className="text-amber-600 text-xs mt-1">
                    Upgrade to Premium for 7+ questions and detailed scoring.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Questions Step */}
        {step === "questions" && (
          <motion.div key="questions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Mock Interview
                    </CardTitle>
                    <CardDescription>{jobTitle}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentQ + 1} of {questions.length}
                  </Badge>
                </div>
                <Progress value={((currentQ + 1) / questions.length) * 100} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        questions[currentQ]?.type === "behavioral"
                          ? "default"
                          : questions[currentQ]?.type === "technical"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs capitalize"
                    >
                      {questions[currentQ]?.type || "general"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {questions[currentQ]?.focus_area}
                    </span>
                  </div>
                  <p className="text-lg font-medium">{questions[currentQ]?.question}</p>
                  {questions[currentQ]?.tips && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      💡 {questions[currentQ].tips}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Your Answer</Label>
                  <Textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={reset}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Restart
                  </Button>
                  <Button onClick={submitAnswer} disabled={!currentAnswer.trim() || feedbackLoading}>
                    {feedbackLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : currentQ < questions.length - 1 ? (
                      <>
                        Next Question <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Submit All Answers
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feedback Step */}
        {step === "feedback" && feedback && (
          <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
                    <span className="text-3xl font-bold text-white">{feedback.overall_score}</span>
                  </div>
                  <h2 className="text-xl font-bold">Overall Score</h2>
                  <p className="text-sm text-muted-foreground">
                    {feedback.overall_score >= 80
                      ? "Excellent performance!"
                      : feedback.overall_score >= 60
                      ? "Good effort! Room for improvement."
                      : "Keep practicing — you'll get better!"}
                  </p>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(feedback.scores).map(([key, score]) => (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm capitalize font-medium">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="text-lg font-bold">{score}</span>
                      </div>
                      <Progress value={score} />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strengths & Improvements */}
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500" /> Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-green-500">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" /> Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {feedback.areas_for_improvement.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-amber-500">→</span> {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Advice */}
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
                <CardContent className="p-6">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" /> Actionable Advice
                  </h3>
                  <p className="text-sm text-muted-foreground">{feedback.actionable_advice}</p>
                </CardContent>
              </Card>

              <Button onClick={reset} className="w-full" variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Practice Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

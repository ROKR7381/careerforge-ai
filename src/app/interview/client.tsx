"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChatWindow } from "@/components/interview/ChatWindow";
import { ReportCard } from "@/components/interview/ReportCard";
import {
  startInterview,
  sendChatMessage,
  createSessionId,
} from "@/lib/interview-client";

interface Message {
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

interface Props {
  user: { id: string; email: string; name: string | null; subscriptionPlan: string; subscriptionStatus: string | null };
}

const FIELDS = ["Tech", "Finance", "Marketing", "HR", "Consulting"];
const LEVELS = [
  { value: "fresher", label: "Fresher (0-2 yr)" },
  { value: "mid", label: "Mid (2-5 yr)" },
  { value: "senior", label: "Senior (5+ yr)" },
  { value: "lead", label: "Lead/Manager" },
];

export function InterviewClient({ user }: Props) {
  const [step, setStep] = useState<"setup" | "chat" | "report">("setup");
  const [field, setField] = useState("Tech");
  const [level, setLevel] = useState("fresher");
  const [questionCount, setQuestionCount] = useState(10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [questionsTotal, setQuestionsTotal] = useState(10);
  const [sessionScore, setSessionScore] = useState(0);
  const [evaluations, setEvaluations] = useState<Message["evaluation"][]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === "chat") {
      inputRef.current?.focus();
    }
  }, [step]);

  async function beginInterview() {
    setLoading(true);
    const sid = createSessionId(field, level);
    setSessionId(sid);
    try {
      const res = await startInterview({
        field,
        level,
        target_question_count: questionCount,
      });
      setSessionId(res.session_id);
      setQuestionsTotal(res.questions_total);
      setQuestionsAsked(res.questions_asked);
      setMessages([{ role: "bot", content: res.reply }]);
      setStep("chat");
    } catch (e: any) {
      toast.error(e.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage({
        message: content.trim(),
        session_id: sessionId,
        target_question_count: questionCount,
      });
      const botMsg: Message = { role: "bot", content: res.reply };
      if (res.evaluation) {
        botMsg.evaluation = res.evaluation;
        setEvaluations((prev) => [...prev, res.evaluation]);
      }
      setMessages((prev) => [...prev, botMsg]);
      setQuestionsAsked(res.questions_asked);
      setSessionScore(res.session_score);
      if (res.is_complete) {
        setTimeout(() => setStep("report"), 800);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to send message");
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function reset() {
    setStep("setup");
    setMessages([]);
    setInput("");
    setSessionId("");
    setQuestionsAsked(0);
    setQuestionsTotal(10);
    setSessionScore(0);
    setEvaluations([]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Interview Prep
                </CardTitle>
                <CardDescription>
                  Practice with an AI interviewer. Answers are scored in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Select value={field} onValueChange={setField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELDS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                  />
                </div>

                <Button
                  onClick={beginInterview}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-[75vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Mock Interview
                </h2>
                <p className="text-sm text-muted-foreground">
                  {field} / {level}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  {questionsAsked}/{questionsTotal}
                </Badge>
                {sessionScore > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Score: {sessionScore.toFixed(1)}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" onClick={reset} title="Restart">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
              <ChatWindow messages={messages} isLoading={loading} />
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                    className="min-h-[44px] max-h-[120px] resize-none"
                    disabled={loading}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon"
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || loading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => sendMessage("hint")}
                      disabled={loading}
                      title="Get a hint"
                    >
                      <Lightbulb className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Type <kbd className="rounded border bg-muted px-1 text-xs">hint</kbd> for a hint,{" "}
                  <kbd className="rounded border bg-muted px-1 text-xs">end</kbd> to finish
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {step === "report" && (
          <ReportCard
            score={sessionScore}
            questionsAsked={questionsAsked}
            questionsTotal={questionsTotal}
            evaluations={evaluations.filter((e): e is NonNullable<typeof e> => e != null)}
            onRestart={reset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

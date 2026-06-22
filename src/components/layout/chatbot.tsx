"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  User,
  Sparkles,
  ChevronUp,
  FileText,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  helpful?: boolean | null;
}

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8003";

const QUICK_QUESTIONS = [
  "How do I write a strong resume?",
  "What is the XYZ formula?",
  "How does ATS scoring work?",
  "Which template is best for me?",
  "How do I optimize my resume?",
  "What are the pricing plans?",
  "Can I export to Word?",
  "How do mock interviews work?",
];

const GENERAL_KNOWLEDGE: Record<string, string> = {
  // Career advice
  "resume tips": "Here are key resume tips:\n\n1. **Tailor every resume** to the specific job posting\n2. **Use the XYZ formula**: 'Accomplished [X] as measured by [Y] by doing [Z]'\n3. **Start bullets with action verbs**: Led, Built, Achieved, Optimized\n4. **Quantify results**: Use numbers, percentages, dollar amounts\n5. **Keep it 1 page** (2 pages max for 10+ years experience)\n6. **Use clean formatting**: No tables, columns, or graphics for ATS\n7. **Include keywords** from the job description naturally\n8. **Proofread twice** — typos kill credibility",

  "interview tips": "Top interview preparation tips:\n\n1. **Research the company** — know their mission, products, recent news\n2. **Use the STAR method** for behavioral questions (Situation, Task, Action, Result)\n3. **Prepare 3-5 stories** that showcase your skills\n4. **Practice aloud** — not just in your head\n5. **Prepare questions** to ask the interviewer\n6. **Dress professionally** — even for video calls\n7. **Follow up** with a thank-you email within 24 hours\n\nTry our Mock Interview tool in the sidebar for AI-powered practice!",

  "cover letter": "A strong cover letter should:\n\n1. **Open with impact** — mention the specific role and why you're excited\n2. **Show, don't tell** — use a specific achievement story\n3. **Connect to the company** — reference their mission or recent work\n4. **Keep it concise** — 3-4 paragraphs, under 400 words\n5. **End with a call to action** — express enthusiasm for an interview\n\nUse our Cover Letter Builder to generate a tailored letter in seconds!",

  "career change": "Switching careers? Here's how to position yourself:\n\n1. **Lead with transferable skills** — leadership, communication, problem-solving\n2. **Highlight relevant projects** or volunteer work\n3. **Use a functional resume format** that emphasizes skills over timeline\n4. **Write a strong summary** that bridges your past and future\n5. **Get certified** — even one certificate adds credibility\n6. **Network actively** — 80% of jobs come through connections\n7. **Tailor every application** — generic resumes don't work for career changers",

  "linkedin": "Optimize your LinkedIn profile:\n\n1. **Headline**: Don't just list your title — add value ('Helping companies scale with data engineering')\n2. **About section**: Write in first person, tell your story\n3. **Experience**: Use the same XYZ formula as your resume\n4. **Skills**: List 50+ relevant skills for maximum visibility\n5. **Recommendations**: Get 5+ recommendations from colleagues\n6. **Activity**: Post weekly — articles, insights, or project updates\n7. **Custom URL**: Set a clean URL (linkedin.com/in/yourname)",

  "salary negotiation": "Negotiate your salary with confidence:\n\n1. **Research market rates** — use Glassdoor, Levels.fyi, Payscale\n2. **Never give a number first** — let them make the offer\n3. **Consider the full package** — benefits, equity, PTO, remote flexibility\n4. **Practice your pitch** — 'Based on my research and experience...'\n5. **Get it in writing** — verbal offers aren't guarantees\n6. **Be willing to walk away** — your leverage comes from options\n7. **Timing matters** — negotiate after they say yes, not before",

  "remote work": "Land a remote job:\n\n1. **Highlight remote experience** — mention async communication, self-management\n2. **List remote tools** — Slack, Zoom, Notion, Asana, GitHub\n3. **Show results, not hours** — focus on output and deliverables\n4. **Tailor to remote-friendly companies** — check their remote policy\n5. **Prepare for async interviews** — some companies use video recordings\n6. **Demonstrate time zone awareness** — mention overlap hours",

  "skills to learn": "Most in-demand skills for 2025-2026:\n\n**Tech**: Python, TypeScript, React, AWS/Azure, Docker, Kubernetes, AI/ML\n**Data**: SQL, Python, Tableau, Power BI, Machine Learning\n**Business**: Agile/Scrum, Project Management, Data Analysis\n**Soft Skills**: Communication, Leadership, Problem-solving, Adaptability\n\nPro tip: Don't just list skills — demonstrate them through projects and achievements on your resume!",
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! 👋 I'm your CareerForge AI assistant.\n\nI can help with:\n• Resume writing & optimization\n• Interview preparation\n• Career advice & job search\n• Using CareerForge features\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    const lower = userMessage.toLowerCase().trim();

    // Check general knowledge first
    for (const [key, response] of Object.entries(GENERAL_KNOWLEDGE)) {
      if (lower.includes(key)) return response;
    }

    // Keyword-based shortcuts for common queries
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "Hello! 😊 Great to see you here. What can I help you with today? Whether it's resume tips, interview prep, or navigating CareerForge — I'm here to help!";
    }
    if (lower.includes("thank")) {
      return "You're welcome! 😄 Happy to help. Is there anything else you'd like to know about building your resume or preparing for interviews?";
    }
    if (lower.includes("bye") || lower.includes("goodbye")) {
      return "Goodbye! 👋 Good luck with your job search. Remember — every great career starts with a great resume. Come back anytime!";
    }
    if (lower.includes("help")) {
      return "I can help with:\n\n📝 **Resume Writing** — tips, format, structure, keywords\n🎯 **ATS Optimization** — how to pass applicant tracking systems\n💼 **Interview Prep** — STAR method, common questions, mock practice\n💼 **Career Advice** — salary negotiation, LinkedIn, career changes\n🛠️ **CareerForge Features** — builder, templates, export, pricing\n\nJust ask away!";
    }

    // Try calling the AI backend
    try {
      const res = await fetch(`${PYTHON_API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: "career advice and resume building assistant",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.response) return data.response;
      }
    } catch {
      // Backend not available, fall through to local responses
    }

    // Local fallback with more expressive responses
    if (lower.includes("xyz") || lower.includes("formula") || lower.includes("bullet")) {
      return "The **XYZ formula** is Google's gold standard for resume bullets:\n\n**Accomplished [X]** (what you achieved)\n**as measured by [Y]** (the metric/result)\n**by doing [Z]** (how you did it)\n\n**Examples:**\n• 'Increased database performance by 40% (Y) by implementing Redis caching (Z), reducing API response times (X)'\n• 'Reduced customer churn by 25% (Y) by building an automated retention workflow (Z), saving $50K annually (X)'\n\nOur AI Co-Pilot in the Builder automatically rewrites your bullets using this formula! 🚀";
    }

    if (lower.includes("ats") || lower.includes("score") || lower.includes("scan") || lower.includes("pass")) {
      return "Our **ATS Score Checker** analyzes your resume across 6 critical dimensions:\n\n✅ **Keywords** (30 pts) — matches against job description\n✅ **Content** (20 pts) — completeness of sections\n✅ **Formatting** (15 pts) — ATS-friendly structure\n✅ **Action Verbs** (15 pts) — strong, impactful language\n✅ **Quantifiable Results** (12 pts) — metrics and numbers\n✅ **Contact Info** (8 pts) — professional presence\n\nAim for **80+** to pass most ATS systems. Try it at the /ats page!";
    }

    if (lower.includes("template") || lower.includes("style") || lower.includes("layout")) {
      return "We have **10 professional templates** designed for different roles:\n\n🏢 **Dublin** — Two-column with dark sidebar (great all-rounder)\n🎨 **Toronto** — Modern accent bar (creative roles)\n📋 **Stockholm** — Minimalist, ATS-optimized (finance/tech)\n👔 **London** — Executive serif (leadership roles)\n🌟 **Sydney** — Vibrant banner layout (marketing/design)\n👑 **Berlin** — Executive dark + gold (C-level)\n🌸 **Tokyo** — Modern rose + skill badges (creative/tech)\n🏙️ **New York** — Emerald sidebar (corporate)\n🗼 **Paris** — Elegant centered serif (academia)\n🌊 **Melbourne** — Teal coral gradient (startups)\n\nAll templates are ATS-friendly! Switch instantly in the builder.";
    }

    if (lower.includes("price") || lower.includes("pricing") || lower.includes("plan") || lower.includes("subscription") || lower.includes("free") || lower.includes("cost")) {
      return "Here's our pricing breakdown:\n\n🆓 **Free** ($0/mo)\n• 1 resume, 3 templates, watermarked PDF\n• Perfect for trying us out\n\n🎓 **Student** ($5/mo) — Most Popular!\n• Unlimited resumes, all templates\n• Unwatermarked PDF/Excel, unlimited AI\n\n💼 **Professional** ($10/mo)\n• Up to 3 resumes, all templates\n• 10 AI enhancements/month\n\n👑 **Annual** ($99/yr)\n• All features, 50%+ savings\n• 1-on-1 resume review, VIP support\n\nNo hidden fees. Cancel anytime!";
    }

    if (lower.includes("export") || lower.includes("pdf") || lower.includes("word") || lower.includes("download") || lower.includes("excel")) {
      return "You can export your resume in **5 formats**:\n\n📄 **Print PDF** — Best quality, use browser print\n📊 **HTML** — Web-ready format\n📕 **PDF Download** — Direct download\n📝 **Word (.doc)** — Editable in Microsoft Word\n📋 **Plain Text (.txt)** — ATS-safe, no formatting\n\nAll exports preserve your content perfectly. Premium users get unwatermarked PDFs!";
    }

    if (lower.includes("interview") || lower.includes("mock") || lower.includes("coaching")) {
      return "Our **Mock Interview Simulator** helps you practice:\n\n1️⃣ **Generate questions** — AI creates behavioral, technical, and cultural fit questions based on your resume\n2️⃣ **Record answers** — type or speak your response\n3️⃣ **Get scored** — detailed feedback on content, clarity, and impact\n4️⃣ **Improve** — see strengths and areas to work on\n\nIt's like having a career coach available 24/7! Try it at /interview 🎯";
    }

    if (lower.includes("job") || lower.includes("search") || lower.includes("match")) {
      return "Our **Job Discovery** tool helps you find the right fit:\n\n1. Paste your resume + a job description\n2. Get a **match score** (0-100%)\n3. See **keyword matches** and gaps\n4. Get **suggestions** to improve your fit\n\nYou can also use the ATS Checker to see how your resume performs against specific job postings! 🔍";
    }

    if (lower.includes("builder") || lower.includes("create") || lower.includes("start") || lower.includes("new resume")) {
      return "Creating a resume with CareerForge is easy:\n\n1. **Sign up** (free!) at /signup\n2. **Go to Builder** at /builder\n3. **Choose a template** — pick from 10 designs\n4. **Fill in your details** — or paste an existing resume\n5. **AI optimizes** — click 'AI Optimize' for instant improvements\n6. **Export** — download as PDF, Word, or share via link\n\nPro tip: Add a job description for targeted keyword optimization! 🚀";
    }

    if (lower.includes("cover letter")) {
      return "Our **Cover Letter Builder** makes it effortless:\n\n1. Select a template (Dublin, Stockholm, or Toronto style)\n2. Choose your tone: Professional, Creative, Confident, or Warm\n3. AI generates a personalized letter based on your resume\n4. Edit and customize as needed\n5. Print or download\n\nA great cover letter can be the difference between 'maybe' and 'yes'! ✉️";
    }

    if (lower.includes("optimize") || lower.includes("improve") || lower.includes("better")) {
      return "To optimize your resume for maximum impact:\n\n1. **Use AI Optimize** in the builder — one-click XYZ formula rewrite\n2. **Add a job description** for targeted keyword matching\n3. **Check your ATS Score** at /ats — fix any warnings\n4. **Use strong action verbs** — Led, Built, Achieved, Optimized\n5. **Quantify everything** — numbers, percentages, dollar amounts\n6. **Keep it concise** — 1 page for most roles\n\nOur AI Co-Pilot can rewrite entire sections for you! 🤖";
    }

    // Default fallback with personality
    return `That's a great question! While I'm primarily focused on resume and career topics, here's what I can help with:\n\n📝 **Resume Writing** — structure, content, keywords\n🎯 **ATS Optimization** — passing applicant tracking systems\n💼 **Interview Prep** — STAR method, mock practice\n🛠️ **CareerForge Features** — builder, templates, export\n💼 **Career Advice** — LinkedIn, salary negotiation, career changes\n\nCould you rephrase your question around one of these topics? I'd love to help! 😊`;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay for natural feel
    const delay = 400 + Math.random() * 800;
    setTimeout(async () => {
      const response = await getAIResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: response,
          timestamp: new Date(),
          helpful: null,
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="mb-4 w-[320px] sm:w-[360px]"
          >
            <Card className="shadow-2xl border-2 border-indigo-100 overflow-hidden flex flex-col h-[480px] rounded-2xl">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-3 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-semibold flex items-center gap-1">
                      CareerForge AI
                      <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300 animate-pulse" />
                    </CardTitle>
                    <p className="text-[9px] text-indigo-200">Resume & Career Assistant</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/10 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>

              {/* Chat Feed */}
              <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 text-[11px]">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                        msg.sender === "bot"
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                          : "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                      }`}
                    >
                      {msg.sender === "bot" ? (
                        <FileText className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                        msg.sender === "bot"
                          ? "bg-white text-foreground rounded-bl-md border border-slate-200"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md"
                      } whitespace-pre-line`}
                    >
                      {msg.text}
                      {/* Feedback buttons for bot messages */}
                      {msg.sender === "bot" && msg.id !== "welcome" && msg.helpful === null && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400">Helpful?</span>
                          <button
                            className="text-slate-300 hover:text-green-500 transition-colors"
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((m) => (m.id === msg.id ? { ...m, helpful: true } : m))
                              );
                            }}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            className="text-slate-300 hover:text-red-400 transition-colors"
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((m) => (m.id === msg.id ? { ...m, helpful: false } : m))
                              );
                            }}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      {msg.helpful === true && (
                        <div className="flex items-center gap-1 mt-1 text-[9px] text-green-500">
                          <ThumbsUp className="h-2.5 w-2.5" /> Glad this helped!
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-1.5">
                    <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={feedEndRef} />
              </CardContent>

              {/* Suggested Questions */}
              <div className="px-3 py-2 border-t border-slate-200 bg-white space-y-1.5">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ChevronUp className="h-2.5 w-2.5" /> Quick Questions
                </p>
                <div className="flex gap-1 flex-wrap max-h-[60px] overflow-y-auto">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      className="text-[9.5px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-full px-2 py-0.5 transition-colors text-left truncate max-w-[170px]"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <CardFooter className="p-2 border-t border-slate-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }}
                  className="flex w-full items-center gap-1.5"
                >
                  <Input
                    placeholder="Ask anything about resumes, careers..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-9 text-[11px] rounded-full bg-slate-100 border-slate-200 focus-visible:ring-indigo-500"
                    disabled={isTyping}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shrink-0 shadow-md"
                    disabled={!inputValue.trim() || isTyping}
                  >
                    {isTyping ? (
                      <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5 text-white" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="relative group">
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-md opacity-70 animate-pulse group-hover:opacity-100 transition-opacity" />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl border-2 border-white/30 focus:outline-none z-10"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="relative">
              <FileText className="h-5.5 w-5.5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}

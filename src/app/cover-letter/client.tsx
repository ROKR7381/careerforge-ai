"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Printer,
  Copy,
  Sparkles,
  Loader2,
  Save,
  User,
  Building,
  FileText,
  Trash2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface CoverLetterData {
  sender_name: string;
  sender_title: string;
  sender_email: string;
  sender_phone: string;
  sender_loc: string;
  recipient_name: string;
  recipient_title: string;
  company_name: string;
  company_addr: string;
  date: string;
  job_title: string;
  subject: string;
  body: string;
}

const sampleCoverLetter: CoverLetterData = {
  sender_name: "John Doe",
  sender_title: "Senior Software Engineer",
  sender_email: "john.doe@example.com",
  sender_phone: "(123) 456-7890",
  sender_loc: "San Francisco, CA",
  recipient_name: "Jane Smith",
  recipient_title: "Engineering Manager",
  company_name: "InnovateTech Solutions",
  company_addr: "100 Innovation Way, Suite 400\nSan Francisco, CA 94105",
  date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  job_title: "Staff Software Engineer",
  subject: "Application for Staff Software Engineer position",
  body: `Dear Jane Smith,

I am writing to express my enthusiastic interest in the Staff Software Engineer position at InnovateTech Solutions. With over seven years of experience designing scalable cloud architectures, optimizing database pipelines, and leading high-performing engineering teams, I am confident in my ability to make an immediate impact on your product development.

In my previous role as a Senior Engineer at CloudScale Systems, I led the migration of our legacy microservices architecture to a containerized platform, which improved API response times by 35% and saved over $120,000 in annual infrastructure costs. Furthermore, I built and managed an agile engineering team of six, fostering a culture of technical excellence and rapid iteration.

I am particularly drawn to InnovateTech's commitment to building state-of-the-art AI-driven platforms. Your recent launch of the smart-analytics tool aligns perfectly with my background in machine learning integrations and large-scale data engineering. I am eager to bring my expertise in performance optimization and team leadership to your growing engineering organization.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and leadership experience align with the goals of InnovateTech Solutions. I look forward to hearing from you.

Sincerely,

John Doe`
};

export function CoverLetterClient({ user }: { user: any }) {
  const [letter, setLetter] = useState<CoverLetterData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cover_letter_draft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return sampleCoverLetter;
  });

  const [template, setTemplate] = useState<"dublin" | "stockholm" | "toronto">("dublin");
  const [generating, setGenerating] = useState(false);
  const [aiAchievements, setAiAchievements] = useState("");
  const [aiTone, setAiTone] = useState("professional");

  useEffect(() => {
    localStorage.setItem("cover_letter_draft", JSON.stringify(letter));
  }, [letter]);

  const handleUpdate = (key: keyof CoverLetterData, value: string) => {
    setLetter((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateAI = async () => {
    if (!letter.sender_name || !letter.company_name || !letter.job_title) {
      toast.error("Please fill in Sender Name, Company, and Job Title to guide the AI.");
      return;
    }
    setGenerating(true);
    try {
      const bulletPoints = aiAchievements
        ? aiAchievements.split("\n").map((b) => b.trim()).filter((b) => b.length > 0)
        : [];
      
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: letter.sender_name,
          sender_title: letter.sender_title,
          company_name: letter.company_name,
          job_title: letter.job_title,
          bullet_points: bulletPoints,
          tone: aiTone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Generation failed");
      }

      const data = await res.json();
      handleUpdate("body", data.letter);
      toast.success("AI cover letter generated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate cover letter. Verify the Python backend is running.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = () => {
    const text = `${letter.date}\n\n${letter.recipient_name}\n${letter.recipient_title}\n${letter.company_name}\n${letter.company_addr}\n\nSubject: ${letter.subject}\n\n${letter.body}`;
    navigator.clipboard.writeText(text);
    toast.success("Cover letter text copied to clipboard!");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50/50">
      {/* CSS print utility override */}
      <style jsx global>{`
        @media print {
          header, nav, aside, footer, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>

      {/* Left Form Panel */}
      <div className="w-[45%] overflow-y-auto border-r border-border bg-white p-6 no-print flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Cover Letter Builder</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Build modern cover letters matching your resume, or generate tailored letters using AI in seconds.
          </p>
        </div>

        <Tabs defaultValue="editor" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="editor">Letter Content</TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/20" /> AI Writer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-5">
            {/* Sender details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <User className="h-4 w-4 text-slate-400" /> Sender Information (You)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Your Full Name</Label>
                  <Input
                    value={letter.sender_name}
                    onChange={(e) => handleUpdate("sender_name", e.target.value)}
                    placeholder="John Doe"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Your Professional Title</Label>
                  <Input
                    value={letter.sender_title}
                    onChange={(e) => handleUpdate("sender_title", e.target.value)}
                    placeholder="Senior Developer"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email Address</Label>
                  <Input
                    value={letter.sender_email}
                    onChange={(e) => handleUpdate("sender_email", e.target.value)}
                    placeholder="john@example.com"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    value={letter.sender_phone}
                    onChange={(e) => handleUpdate("sender_phone", e.target.value)}
                    placeholder="(123) 456-7890"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Location (City, State)</Label>
                  <Input
                    value={letter.sender_loc}
                    onChange={(e) => handleUpdate("sender_loc", e.target.value)}
                    placeholder="San Francisco, CA"
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Recipient Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Building className="h-4 w-4 text-slate-400" /> Recipient & Job Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Hiring Manager Name</Label>
                  <Input
                    value={letter.recipient_name}
                    onChange={(e) => handleUpdate("recipient_name", e.target.value)}
                    placeholder="Jane Smith"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Hiring Manager Title</Label>
                  <Input
                    value={letter.recipient_title}
                    onChange={(e) => handleUpdate("recipient_title", e.target.value)}
                    placeholder="Recruiting Lead"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    value={letter.company_name}
                    onChange={(e) => handleUpdate("company_name", e.target.value)}
                    placeholder="InnovateTech Solutions"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date</Label>
                  <Input
                    value={letter.date}
                    onChange={(e) => handleUpdate("date", e.target.value)}
                    placeholder="October 25, 2026"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Company Address</Label>
                  <Textarea
                    value={letter.company_addr}
                    onChange={(e) => handleUpdate("company_addr", e.target.value)}
                    placeholder="100 Main Street, Suite 400"
                    rows={2}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Target Job Title</Label>
                  <Input
                    value={letter.job_title}
                    onChange={(e) => handleUpdate("job_title", e.target.value)}
                    placeholder="Staff Software Engineer"
                    className="h-8.5 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subject Line</Label>
                  <Input
                    value={letter.subject}
                    onChange={(e) => handleUpdate("subject", e.target.value)}
                    placeholder="Application for Software position"
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Template & Body */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <FileText className="h-4 w-4 text-slate-400" /> Cover Letter Body
                </h3>
                <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
                  {(["dublin", "stockholm", "toronto"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`capitalize text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                        template === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Textarea
                  value={letter.body}
                  onChange={(e) => handleUpdate("body", e.target.value)}
                  placeholder="Dear hiring manager..."
                  rows={12}
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-4">
            <Card className="border border-indigo-100 bg-indigo-50/20 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600 fill-indigo-600/10" /> AI Cover Letter Writer
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Let AI compose a tailored cover letter demonstrating how your achievements solve the employer's needs.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Tone of the letter</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["professional", "creative", "confident", "warm"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAiTone(t)}
                        className={`capitalize text-[10px] py-1.5 rounded-lg border font-semibold transition-all ${
                          aiTone === t
                            ? "bg-indigo-600 border-indigo-600 text-white shadow"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center justify-between">
                    <span>Key Achievements & Skills (optional)</span>
                    <span className="text-[10px] text-muted-foreground font-normal">One per line</span>
                  </Label>
                  <Textarea
                    value={aiAchievements}
                    onChange={(e) => setAiAchievements(e.target.value)}
                    placeholder="• Migrated microservices API response times by 35%
• Saved $120k annually in cloud infrastructure
• Mentored 6 junior engineers"
                    rows={4}
                    className="text-xs bg-white"
                  />
                </div>

                <Button
                  onClick={handleGenerateAI}
                  disabled={generating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-2 shadow-sm rounded-xl text-xs font-bold"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Composing Cover Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Compose with CareerForge AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Canvas Preview Panel */}
      <div className="flex-1 overflow-y-auto bg-slate-100/50 p-8 flex flex-col items-center">
        <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between no-print">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Live Preview &middot; <span className="text-slate-800 font-bold capitalize">{template} layout</span>
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyText} className="h-8 text-xs">
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Text
            </Button>
            <Button size="sm" onClick={() => window.print()} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm">
              <Printer className="h-3.5 w-3.5 mr-1" /> Print PDF
            </Button>
          </div>
        </div>

        {/* Letter Page Sheet Canvas */}
        <div className="print-area w-full max-w-[210mm] min-h-[297mm] bg-white border border-slate-200 shadow-xl p-[20mm] relative flex flex-col font-sans text-slate-800 leading-relaxed text-sm select-text overflow-hidden">
          
          {/* Dublin Template */}
          {template === "dublin" && (
            <div className="space-y-6">
              {/* Dublin Blue Ribbon Header */}
              <div className="-mx-[20mm] -mt-[20mm] bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-8 mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight">{letter.sender_name}</h2>
                <p className="text-xs text-indigo-100 font-medium tracking-wide mt-1">{letter.sender_title}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-[10.5px] text-indigo-100/90 font-medium">
                  {letter.sender_email && <span>{letter.sender_email}</span>}
                  {letter.sender_phone && <span>&middot; {letter.sender_phone}</span>}
                  {letter.sender_loc && <span>&middot; {letter.sender_loc}</span>}
                </div>
              </div>

              {/* Date & Recipient */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-semibold">{letter.date}</p>
                <div className="text-slate-700 space-y-1 text-xs">
                  <p className="font-bold text-slate-800">{letter.recipient_name}</p>
                  <p className="font-medium">{letter.recipient_title}</p>
                  <p className="font-semibold text-indigo-700">{letter.company_name}</p>
                  <p className="whitespace-pre-line text-slate-500">{letter.company_addr}</p>
                </div>
              </div>

              {/* Subject */}
              {letter.subject && (
                <div className="border-l-2 border-indigo-600 pl-3">
                  <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Subject</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">{letter.subject}</p>
                </div>
              )}

              {/* Body */}
              <p className="whitespace-pre-line text-slate-600 leading-relaxed text-xs pt-2">
                {letter.body}
              </p>
            </div>
          )}

          {/* Stockholm Template */}
          {template === "stockholm" && (
            <div className="space-y-6 pt-4">
              {/* Centered Editorial Header */}
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-light tracking-widest text-slate-900 uppercase">{letter.sender_name}</h2>
                <p className="text-[10px] tracking-widest uppercase text-slate-400 font-bold">{letter.sender_title}</p>
                <div className="w-12 h-[1px] bg-slate-300 mx-auto my-3" />
                <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-semibold">
                  {letter.sender_email && <span>{letter.sender_email}</span>}
                  {letter.sender_phone && <span>{letter.sender_phone}</span>}
                  {letter.sender_loc && <span>{letter.sender_loc}</span>}
                </div>
              </div>

              {/* Recipient on Left, Date on Right */}
              <div className="flex justify-between items-start text-xs pt-4 border-t border-slate-100">
                <div className="space-y-1 text-slate-700">
                  <p className="font-bold text-slate-800">{letter.recipient_name}</p>
                  <p className="font-medium text-slate-500">{letter.recipient_title}</p>
                  <p className="font-bold text-slate-800">{letter.company_name}</p>
                  <p className="whitespace-pre-line text-slate-400">{letter.company_addr}</p>
                </div>
                <p className="text-slate-400 font-medium">{letter.date}</p>
              </div>

              {/* Subject */}
              {letter.subject && (
                <div className="pt-2">
                  <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-widest text-[10px]">Re: {letter.subject}</p>
                </div>
              )}

              {/* Body */}
              <p className="whitespace-pre-line text-slate-600 leading-relaxed text-xs pt-2">
                {letter.body}
              </p>
            </div>
          )}

          {/* Toronto Template */}
          {template === "toronto" && (
            <div className="space-y-6 flex-1 flex flex-col">
              {/* Colored Ribbon top bar */}
              <div className="-mx-[20mm] -mt-[20mm] h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
              
              <div className="flex justify-between items-start pt-6 border-b border-slate-100 pb-6 mb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">{letter.sender_name}</h2>
                  <p className="text-xs text-emerald-600 font-bold">{letter.sender_title}</p>
                </div>
                <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                  {letter.sender_email && <p>{letter.sender_email}</p>}
                  {letter.sender_phone && <p>{letter.sender_phone}</p>}
                  {letter.sender_loc && <p>{letter.sender_loc}</p>}
                </div>
              </div>

              {/* Date & Recipient */}
              <div className="space-y-4">
                <p className="text-xs text-slate-400 font-semibold">{letter.date}</p>
                <div className="text-slate-700 space-y-1 text-xs">
                  <p className="font-bold text-slate-900">{letter.recipient_name}</p>
                  <p className="font-medium text-slate-500">{letter.recipient_title}</p>
                  <p className="font-bold text-emerald-700">{letter.company_name}</p>
                  <p className="whitespace-pre-line text-slate-500">{letter.company_addr}</p>
                </div>
              </div>

              {/* Subject */}
              {letter.subject && (
                <div className="pt-2">
                  <p className="font-bold text-slate-900 border-l-2 border-emerald-500 pl-2 text-xs">{letter.subject}</p>
                </div>
              )}

              {/* Body */}
              <p className="whitespace-pre-line text-slate-600 leading-relaxed text-xs pt-2">
                {letter.body}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

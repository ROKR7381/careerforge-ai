"use client";

import { useState } from "react";
import { ResumePreview } from "@/components/resume/preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Globe,
  Mail,
  Link2,
  CheckCircle,
  Share2,
} from "lucide-react";
import { TemplateName, ResumeData } from "@/types/resume";
import { toast } from "sonner";

interface ShareClientProps {
  resume: ResumeData;
  title: string;
  templateName: TemplateName;
  shareUrl: string;
}

export function ShareClient({ resume, title, templateName, shareUrl }: ShareClientProps) {
  const [template, setTemplate] = useState<TemplateName>(templateName || "dublin");
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `Check out my resume: ${resume.personal_info.full_name}`;
    const url = shareUrl;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank");
        break;
      case "email":
        window.open(`mailto:?subject=${encodeURIComponent(`${resume.personal_info.full_name} - Resume`)}&body=${encodedText}%0A%0A${encodedUrl}`, "_blank");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 print:bg-white print:py-0">
      {/* Control Bar */}
      <div className="mx-auto max-w-5xl px-4 pt-8 mb-6 print:hidden">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                {resume.personal_info.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {resume.personal_info.full_name}
                </h1>
                <p className="text-sm text-slate-500">{resume.personal_info.professional_title}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Globe className="h-3 w-3" />
                  Hosted on CareerForge AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleCopyLink} variant="outline" className="text-xs">
                {copied ? (
                  <CheckCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                ) : (
                  <Link2 className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" /> Print / PDF
              </Button>
            </div>
          </div>

          {/* Social Share Row */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 mr-2">Share:</span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs rounded-full"
              onClick={() => handleShare("linkedin")}
            >
              <Share2 className="h-3 w-3 mr-1" /> LinkedIn
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs rounded-full"
              onClick={() => handleShare("twitter")}
            >
              <Share2 className="h-3 w-3 mr-1" /> Twitter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs rounded-full"
              onClick={() => handleShare("email")}
            >
              <Mail className="h-3 w-3 mr-1" /> Email
            </Button>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center justify-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-2">
          <span className="text-xs text-slate-400 px-2">Template:</span>
          {(["dublin", "toronto", "stockholm", "london", "sydney", "berlin", "tokyo", "newyork", "paris", "melbourne"] as TemplateName[]).map((t) => (
            <Button
              key={t}
              variant={template === t ? "default" : "ghost"}
              size="sm"
              className="capitalize text-xs px-2.5 h-7 rounded-md"
              onClick={() => setTemplate(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {/* Resume Canvas */}
      <div className="mx-auto max-w-[210mm] px-4 pb-10 print:px-0 print:pb-0">
        <div className="shadow-2xl border border-slate-200 bg-white print:shadow-none print:border-none rounded-sm overflow-hidden">
          <ResumePreview resume={resume} template={template} />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="print:hidden pb-8 text-center">
        <p className="text-xs text-slate-400">
          Built with <span className="font-semibold text-indigo-500">CareerForge AI</span> — Build your dream career
        </p>
      </div>
    </div>
  );
}

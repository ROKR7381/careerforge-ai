"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ModernTemplate } from "@/components/resume/ModernTemplate";
import {
  Download,
  Layout,
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function ResumeBuilder() {
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    degree: "",
    university: "",
    skills: ["React", "Next.js", "TypeScript"],
    experience: [
      { company: "", year: "", role: "", description: "" },
    ],
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Forge<span className="text-indigo-600">AI</span>
          </h1>
        </div>

        <PDFDownloadLink
          document={<ModernTemplate data={formData} />}
          fileName="Executive_Resume.pdf"
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-semibold hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
        >
          {({ loading }) => (
            <>
              <Download size={18} />{" "}
              {loading ? "Rendering HD..." : "Download Resume"}
            </>
          )}
        </PDFDownloadLink>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left: Input Sections with Glassmorphism */}
        <div className="p-8 border-r border-slate-200 bg-white overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="space-y-12">
            {/* Personal Info */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <User size={20} />
                <h2 className="font-bold uppercase tracking-wider text-sm">
                  Personal Information
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <input
                    placeholder="Full Name"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <input
                  placeholder="Job Title"
                  className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <input
                  placeholder="Email"
                  className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </section>

            {/* Work Experience */}
            <section>
              <div className="flex items-center gap-2 mb-6 text-indigo-600">
                <Briefcase size={20} />
                <h2 className="font-bold uppercase tracking-wider text-sm">
                  Work Experience
                </h2>
              </div>
              <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  placeholder="Company Name"
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none"
                />
                <textarea
                  placeholder="Job Description (Multi-line support for HD view)"
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none h-32"
                />
              </div>
            </section>
          </div>
        </div>

        {/* Right: Live HD Preview */}
        <div className="bg-slate-100 p-12 flex justify-center overflow-y-auto max-h-[calc(100vh-80px)]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-[595px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] min-h-[842px] flex"
          >
            {/* Preview Sidebar */}
            <div className="w-[32%] bg-[#0F172A] p-6 text-white text-[10px]">
              <div className="w-12 h-1 bg-indigo-500 mb-6" />
              <p className="opacity-60 uppercase text-[8px] font-bold tracking-widest mb-2">
                Contact
              </p>
              <p className="mb-4">
                {formData.email || "email@example.com"}
              </p>
              <p className="opacity-60 uppercase text-[8px] font-bold tracking-widest mb-2">
                Skills
              </p>
              {formData.skills.map((s) => (
                <p key={s} className="mb-1">
                  {" "}
                  {s}
                </p>
              ))}
            </div>
            {/* Preview Body */}
            <div className="flex-1 p-10">
              <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                {formData.fullName || "YOUR NAME"}
              </h1>
              <p className="text-indigo-600 font-semibold text-xs mt-1 uppercase tracking-widest">
                {formData.title || "SOFTWARE ENGINEER"}
              </p>
              <div className="mt-8 border-b border-slate-100 pb-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Profile
                </h3>
              </div>
              <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">
                {formData.summary || "Summary content goes here..."}
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

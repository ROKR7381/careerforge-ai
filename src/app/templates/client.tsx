"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Sparkles,
  Search,
  ChevronDown,
  ExternalLink,
  Info,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
  user: any;
  initialCategory?: string;
}

const TEMPLATE_CARDS = [
  {
    id: "dublin",
    name: "Clear (Creative / Professional)",
    description: "Striking modern header, professional two column template structure. Perfect for creative roles, startups, and marketing executives.",
    categories: ["Creative", "Professional"],
    image: "/p3.png",
    accent: "indigo",
    features: ["Two-Column Layout", "Modern Title Block", "Sidebar Contact Detail Grid"],
    pdfUrl: "/builder?template=dublin&format=pdf",
    docxUrl: "/builder?template=dublin&format=docx",
  },
  {
    id: "stockholm",
    name: "Precision ATS (One Column / Professional)",
    description: "Showcase career skills through a highlighted skills section. Highly readable, ATS-optimized layout preferred by recruiters in finance & tech.",
    categories: ["ATS-Friendly", "Professional"],
    image: "/p4.png",
    accent: "slate",
    features: ["Single-Column Focus", "ATS-optimized Parsing", "Skill Highlight Bar"],
    pdfUrl: "/builder?template=stockholm&format=pdf",
    docxUrl: "/builder?template=stockholm&format=docx",
  },
  {
    id: "toronto",
    name: "Modern Accent (Toronto / Professional)",
    description: "Sleek corporate layout with colored accent bar for high visual impact. Highlights project timelines and professional credentials.",
    categories: ["Modern", "Professional"],
    image: "/p5.png", // utilizing p5 as preview block
    accent: "emerald",
    features: ["Accent Border Ribbon", "Split Timeline Layout", "Detailed Project Grids"],
    pdfUrl: "/builder?template=toronto&format=pdf",
    docxUrl: "/builder?template=toronto&format=docx",
  },
  {
    id: "london",
    name: "Classic Serif (London / Professional)",
    description: "Traditional centered layout utilizing elegant serif typography. Extremely clean, compact, and professional format preferred for academic or executive roles.",
    categories: ["Modern", "Professional"],
    image: "/p6.png",
    accent: "stone",
    features: ["Serif Typography Focus", "Centered Elegant Header", "Compact Single-Column Grid"],
    pdfUrl: "/builder?template=london&format=pdf",
    docxUrl: "/builder?template=london&format=docx",
  },
  {
    id: "sydney",
    name: "Vibrant Panel (Sydney / Professional)",
    description: "High impact double column layout featuring a dark indigo top panel. Showcases contact details, custom visual timelines, and skill badges.",
    categories: ["Creative", "Professional"],
    image: "/p7.png",
    accent: "indigo",
    features: ["Vibrant Top Title Panel", "Asymmetric Layout Grid", "Vibrant Visual Headers"],
    pdfUrl: "/builder?template=sydney&format=pdf",
    docxUrl: "/builder?template=sydney&format=docx",
  },
  {
    id: "berlin",
    name: "Executive (Berlin / Premium)",
    description: "Distinguished dark header with gold accents. Perfect for C-level executives, senior managers, and leadership roles requiring a premium presentation.",
    categories: ["Professional", "Executive"],
    image: "/p3.png",
    accent: "amber",
    features: ["Dark Executive Header", "Gold Accent Details", "Senior Leadership Focus"],
    pdfUrl: "/builder?template=berlin&format=pdf",
    docxUrl: "/builder?template=berlin&format=docx",
  },
  {
    id: "tokyo",
    name: "Modern Rose (Tokyo / Creative)",
    description: "Sleek rose gradient accent bar with clean two-column layout. Ideal for creative professionals, designers, and modern tech roles.",
    categories: ["Creative", "Modern"],
    image: "/p5.png",
    accent: "rose",
    features: ["Rose Gradient Accent", "Skill Badge System", "Two-Column Efficient Layout"],
    pdfUrl: "/builder?template=tokyo&format=pdf",
    docxUrl: "/builder?template=tokyo&format=docx",
  },
  {
    id: "newyork",
    name: "Emerald Column (New York / Professional)",
    description: "Professional emerald sidebar with clean main content area. Great for finance, consulting, and corporate roles.",
    categories: ["Professional", "ATS-Friendly"],
    image: "/p7.png",
    accent: "emerald",
    features: ["Emerald Professional Sidebar", "Clean Content Flow", "Corporate Ready Format"],
    pdfUrl: "/builder?template=newyork&format=pdf",
    docxUrl: "/builder?template=newyork&format=docx",
  },
  {
    id: "paris",
    name: "Elegant Serif (Paris / Creative)",
    description: "Centered elegant design with serif typography. Perfect for academia, research, editorial, and luxury brand positions.",
    categories: ["Creative", "Professional"],
    image: "/p4.png",
    accent: "slate",
    features: ["Elegant Centered Layout", "Serif Typography Excellence", "Skill Bubble Display"],
    pdfUrl: "/builder?template=paris&format=pdf",
    docxUrl: "/builder?template=paris&format=docx",
  },
  {
    id: "melbourne",
    name: "Teal Coral (Melbourne / Modern)",
    description: "Vibrant teal-coral gradient header with bullet point timeline. Ideal for tech startups, innovation roles, and creative agencies.",
    categories: ["Modern", "Creative"],
    image: "/p6.png",
    accent: "teal",
    features: ["Teal-Coral Gradient Header", "Timeline Bullet System", "Skill Tag Badges"],
    pdfUrl: "/builder?template=melbourne&format=pdf",
    docxUrl: "/builder?template=melbourne&format=docx",
  }
];

export function TemplatesClient({ user, initialCategory }: Props) {
  // Normalize initial category parameter to uppercase/matched styles
  const normalizedInitial = initialCategory 
    ? (initialCategory.toLowerCase() === "ats-friendly" || initialCategory.toLowerCase() === "ats"
        ? "ATS-Friendly"
        : initialCategory.charAt(0).toUpperCase() + initialCategory.slice(1).toLowerCase())
    : "All";

  const [filter, setFilter] = useState<"All" | "Professional" | "Creative" | "ATS-Friendly" | "Modern">(
    ["Professional", "Creative", "ATS-Friendly", "Modern"].includes(normalizedInitial)
      ? (normalizedInitial as any)
      : "All"
  );

  const filteredTemplates = TEMPLATE_CARDS.filter(
    (t) => filter === "All" || t.categories.includes(filter)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Block */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="secondary" className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Premium Templates Collection
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
            Job-Winning <span className="text-indigo-600">Resume Templates</span>
          </h1>
          <p className="max-w-xl mx-auto text-sm text-slate-500">
            Switch template layouts with one click inside our editor. All templates are tested by hiring managers to maximize interview callbacks.
          </p>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-6 mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filter Style:</span>
            
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1.5 h-9 text-xs border-slate-200 hover:bg-slate-50 min-w-[130px] justify-between focus-visible:ring-0">
                  <span className="font-semibold">{filter}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[150px] mt-1 shadow-lg border border-slate-200 rounded-xl">
                {["All", "Professional", "Creative", "ATS-Friendly", "Modern"].map((val) => (
                  <DropdownMenuItem
                    key={val}
                    onClick={() => setFilter(val as any)}
                    className="text-xs cursor-pointer rounded-lg font-medium"
                  >
                    {val}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <strong>{filteredTemplates.length}</strong> styles
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((t, idx) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className="h-full border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-slate-300 transition-all duration-300">
                  {/* Preview Image Container */}
                  <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden border-b border-slate-200">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" asChild className="bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold shadow rounded-full px-4">
                        <Link href={`/builder?template=${t.id}`}>
                          Use Template
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Template Info Content */}
                  <CardContent className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {t.categories.map((c) => (
                            <span key={c} className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded tracking-wide">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <Link href={t.pdfUrl} className="text-[9px] font-bold border border-slate-200 hover:border-slate-300 px-1.5 py-0.5 rounded text-slate-600 hover:text-slate-900 bg-white">
                            PDF
                          </Link>
                          <Link href={t.docxUrl} className="text-[9px] font-bold border border-slate-200 hover:border-slate-300 px-1.5 py-0.5 rounded text-slate-600 hover:text-slate-900 bg-white">
                            DOCX
                          </Link>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-800">{t.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="space-y-1">
                        {t.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      <Button size="sm" asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 mt-2 rounded-xl">
                        <Link href={`/builder?template=${t.id}`} className="flex items-center justify-center gap-1">
                          Create Resume <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

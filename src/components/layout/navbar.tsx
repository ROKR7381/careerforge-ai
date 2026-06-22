"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Briefcase,
  Bot,
  CreditCard,
  LogOut,
  Settings,
  User as UserIcon,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Gauge,
  ChevronDown,
  Globe,
  HelpCircle,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { toast } from "sonner";

interface NavbarProps {
  user?: {
    name: string | null;
    email: string;
    image: string | null;
    subscriptionPlan: string;
  } | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder", label: "Resume Builder", icon: FileText },
  { href: "/cover-letter", label: "Cover Letter", icon: FileCheck },
  { href: "/ats", label: "ATS Score", icon: Gauge },
  { href: "/interview", label: "Interview Prep", icon: Bot },
  { href: "/jobs", label: "Job Discovery", icon: Briefcase },
  { href: "/linkedin", label: "LinkedIn Import", icon: LinkedinNavIcon },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

// lucide-react v1.21 doesn't export Linkedin icon, so we use a custom SVG component.
function LinkedinNavIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const resumeTemplates = {
  professional: [
    {
      name: "Dublin (Professional)",
      description: "Striking modern header, professional two column template structure.",
      template: "dublin",
      pdfUrl: "/builder?template=dublin&format=pdf",
      docxUrl: "/builder?template=dublin&format=docx",
    },
    {
      name: "Toronto (Professional)",
      description: "Sleek corporate layout with colored accent bar for visual impact.",
      template: "toronto",
      pdfUrl: "/builder?template=toronto&format=pdf",
      docxUrl: "/builder?template=toronto&format=docx",
    },
    {
      name: "Stockholm (ATS-Friendly)",
      description: "Showcase career skills through a highlighted skills section. Highly readable.",
      template: "stockholm",
      pdfUrl: "/builder?template=stockholm&format=pdf",
      docxUrl: "/builder?template=stockholm&format=docx",
    },
    {
      name: "London (Executive Serif)",
      description: "Traditional centered layout utilizing elegant serif typography. Classic style.",
      template: "london",
      pdfUrl: "/builder?template=london&format=pdf",
      docxUrl: "/builder?template=london&format=docx",
    }
  ],
  other: [
    {
      name: "Clear (Creative)",
      description: "Striking header & sidebar grid for creative/startup roles.",
      template: "dublin",
      pdfUrl: "/builder?template=dublin&format=pdf",
      docxUrl: "/builder?template=dublin&format=docx",
    },
    {
      name: "Precision ATS (One Column)",
      description: "Hiring manager approved single-column format for corporate success.",
      template: "stockholm",
      pdfUrl: "/builder?template=stockholm&format=pdf",
      docxUrl: "/builder?template=stockholm&format=docx",
    },
    {
      name: "Sydney (Vibrant Panel)",
      description: "High impact double column layout featuring a dark indigo top panel.",
      template: "sydney",
      pdfUrl: "/builder?template=sydney&format=pdf",
      docxUrl: "/builder?template=sydney&format=docx",
    }
  ]
};

const resumeExamples = {
  categories: [
    {
      title: "Education",
      desc: "Educate employers on your skills with a resume fit for any classroom role.",
      href: "/builder?sample=true"
    },
    {
      title: "Government",
      desc: "Create a government resume that commands the attention of department recruiters.",
      href: "/builder?sample=true"
    },
    {
      title: "Engineering",
      desc: "Build the foundation for success highlighting your engineering expertise.",
      href: "/builder?sample=true"
    },
    {
      title: "Retail",
      desc: "Showcase your retail experience with a well-crafted sales resume.",
      href: "/builder?sample=true"
    }
  ],
  popular: [
    { name: "Nurse", href: "/builder?sample=true" },
    { name: "High School Student", href: "/builder?sample=true" },
    { name: "Internship", href: "/builder?sample=true" },
    { name: "Student", href: "/builder?sample=true" },
    { name: "Accountant", href: "/builder?sample=true" },
    { name: "All Examples", href: "/builder?sample=true" }
  ]
};

const resourcesList = [
  { title: "AI Writer Guide", desc: "How to use the Google XYZ formula for resume bullet points.", href: "/#features" },
  { title: "ATS Optimizer Secrets", desc: "Learn how to format resumes to pass ATS scans.", href: "/ats" },
  { title: "Interview Prep Coaching", desc: "Ace your interviews with our real-time AI simulators.", href: "/interview" },
  { title: "Pricing & Billing Tiers", desc: "Find the plan that fits your career development needs.", href: "/billing" }
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"templates" | "examples" | "resources" | null>(null);

  const handleMouseEnter = (type: "templates" | "examples" | "resources") => {
    setActiveDropdown(type);
  };
  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const chatbotBtn = document.querySelector('button[aria-label="chat"]') || document.querySelector('button svg') || document.querySelector('.fixed.bottom-6 button');
    if (chatbotBtn) {
      (chatbotBtn as HTMLElement).click();
      toast.info("Opened our AI Copilot chatbot to answer your questions!");
    } else {
      toast.info("Ask our AI Copilot on the bottom right for instant resume support!");
    }
  };

  const isPublicPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white text-sm font-bold">
              C
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              CareerForge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isPublicPage ? (
              // Public Landing Page Mega Menus (like resume.io)
              <>
                {/* Templates Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("templates")}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link href="/templates" className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary rounded-lg transition-colors cursor-pointer">
                    Resume Templates <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Link>

                  {activeDropdown === "templates" && (
                    <div className="absolute left-0 top-full mt-0 pt-2 w-[600px] z-50">
                      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4.5 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Professional Templates</p>
                            <div className="space-y-1">
                              {resumeTemplates.professional.map((t) => (
                                <div key={t.name} className="flex flex-col gap-0.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                  <div className="flex items-center justify-between">
                                    <Link href={`/builder?template=${t.template}`} className="font-semibold text-xs text-slate-800 hover:text-primary transition-colors">
                                      {t.name}
                                    </Link>
                                    <div className="flex gap-1.5">
                                      <Link href={t.pdfUrl} className="text-[9px] font-extrabold border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 px-1.5 py-0.5 rounded text-slate-600 hover:text-emerald-700 bg-white uppercase transition-colors">
                                        pdf
                                      </Link>
                                      <Link href={t.docxUrl} className="text-[9px] font-extrabold border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-1.5 py-0.5 rounded text-slate-600 hover:text-blue-700 bg-white uppercase transition-colors">
                                        docx
                                      </Link>
                                    </div>
                                  </div>
                                  <p className="text-[10.5px] text-muted-foreground leading-normal">{t.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-3 border-l border-slate-100 pl-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Creative & ATS Styles</p>
                              <div className="space-y-1">
                                {resumeTemplates.other.map((t) => (
                                  <div key={t.name} className="flex flex-col gap-0.5 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                    <div className="flex items-center justify-between">
                                      <Link href={`/builder?template=${t.template}`} className="font-semibold text-xs text-slate-800 hover:text-primary transition-colors">
                                        {t.name}
                                      </Link>
                                      <div className="flex gap-1.5">
                                        <Link href={t.pdfUrl} className="text-[9px] font-extrabold border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 px-1.5 py-0.5 rounded text-slate-600 hover:text-emerald-700 bg-white uppercase transition-colors">
                                          pdf
                                        </Link>
                                        <Link href={t.docxUrl} className="text-[9px] font-extrabold border border-slate-200 hover:border-blue-300 hover:bg-blue-50 px-1.5 py-0.5 rounded text-slate-600 hover:text-blue-700 bg-white uppercase transition-colors">
                                          docx
                                        </Link>
                                      </div>
                                    </div>
                                    <p className="text-[10.5px] text-muted-foreground leading-normal">{t.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Link href="/templates" className="mt-4 inline-flex items-center justify-center gap-1 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 rounded-xl border border-slate-200/60 transition-colors">
                              View All Templates <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Examples Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("examples")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary rounded-lg transition-colors cursor-pointer">
                    Resume Examples <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>

                  {activeDropdown === "examples" && (
                    <div className="absolute left-0 top-full mt-0 pt-2 w-[540px] z-50">
                      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4.5 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">Resume Examples</p>
                            <div className="space-y-1">
                              {resumeExamples.categories.map((cat) => (
                                <Link key={cat.title} href={cat.href} className="group block p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                  <span className="font-semibold text-xs text-slate-800 group-hover:text-primary transition-colors">{cat.title}</span>
                                  <p className="text-[10.5px] text-muted-foreground leading-normal mt-0.5">{cat.desc}</p>
                                </Link>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 border-l border-slate-100 pl-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Most Popular</p>
                            <div className="grid grid-cols-1 gap-1.5 pt-1">
                              {resumeExamples.popular.map((pop) => (
                                <Link key={pop.name} href={pop.href} className="text-xs text-slate-600 hover:text-primary flex items-center justify-between font-medium group py-1 px-2 rounded-md hover:bg-slate-50 transition-colors">
                                  <span>{pop.name}</span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary px-1.5 py-0.5 rounded transition-colors font-bold">Apply</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <Link
                  href="/cover-letter"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary rounded-lg transition-colors"
                >
                  Cover Letter
                </Link>

                {/* FAQ */}
                <a
                  href="#faq"
                  onClick={handleFaqClick}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary rounded-lg transition-colors cursor-pointer"
                >
                  FAQ
                </a>

                {/* Resources Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter("resources")}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary rounded-lg transition-colors cursor-pointer">
                    Resources <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </button>

                  {activeDropdown === "resources" && (
                    <div className="absolute left-0 top-full mt-0 pt-2 w-[320px] z-50">
                      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">Career Resources</p>
                        <div className="grid gap-1">
                          {resourcesList.map((res) => (
                            <Link key={res.title} href={res.href} className="block p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                              <span className="font-semibold text-xs text-slate-800 transition-colors hover:text-primary">{res.title}</span>
                              <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-normal">{res.desc}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Authenticated Application Dashboard links
              navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-slate-700 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })
            )}
          </nav>
        </div>

        {/* Right Nav buttons */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user?.subscriptionPlan !== "FREE" && (
            <Badge variant="success" className="hidden sm:flex items-center gap-1 mr-1">
              <Sparkles className="h-3 w-3" />
              Premium
            </Badge>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1 h-9 rounded-full border border-slate-200/60 hover:bg-slate-50 shadow-sm transition-all focus-visible:ring-0">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">My Account</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl shadow-xl border border-slate-200 p-1.5">
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-800 leading-none">{user.name || "CareerBuilder"}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-1.5">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-1.5">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4 text-slate-500" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-1.5">
                  <Link href="/linkedin">
                    <LinkedinNavIcon className="mr-2 h-4 w-4 text-slate-500" /> LinkedIn Import
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-1.5">
                  <Link href="/billing">
                    <CreditCard className="mr-2 h-4 w-4 text-slate-500" /> Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/5 py-1.5">
                  <a href="/api/auth/logout">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-xs h-8.5 rounded-full px-4 text-slate-700 hover:text-slate-900">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="text-xs h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 shadow-sm">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full h-9 w-9 border border-slate-200/50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4.5 w-4.5 text-slate-700" /> : <Menu className="h-4.5 w-4.5 text-slate-700" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-slate-200/60 bg-white p-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <nav className="flex flex-col gap-1.5">
            {isPublicPage ? (
              // Mobile Public Links
              <>
                <Link href="/templates" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <FileText className="h-4 w-4 text-slate-400" /> Resume Templates
                </Link>
                <Link href="/builder?sample=true" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <FileCheck className="h-4 w-4 text-slate-400" /> Resume Examples
                </Link>
                <Link href="/cover-letter" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <FileCheck className="h-4 w-4 text-slate-400" /> Cover Letter
                </Link>
                <a href="#faq" onClick={(e) => { handleFaqClick(e); setMobileOpen(false); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <HelpCircle className="h-4 w-4 text-slate-400" /> FAQ
                </a>
              </>
            ) : (
              // Mobile Dashboard Links
              navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      isActive
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-slate-700 hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })
            )}
          </nav>
        </motion.div>
      )}
    </header>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: string }) {
  const variants: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-semibold",
    default: "bg-primary/10 text-primary border border-primary/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] ${variants[variant] || variants.default} ${className || ""}`}>
      {children}
    </span>
  );
}

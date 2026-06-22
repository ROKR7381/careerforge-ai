"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  FileText,
  Bot,
  Briefcase,
  Shield,
  Download,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  Target,
  BarChart3,
  Globe,
  Clock,
  Users,
  ChevronDown,
  ChevronRight,
  Award,
  TrendingUp,
  Lock,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
};

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function TypewriterText() {
  const words = ["ATS-Optimized", "AI-Powered", "Recruiter-Approved", "Interview-Ready"];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[index];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setText(currentWord.substring(0, text.length + 1));
          if (text === currentWord) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setText(currentWord.substring(0, text.length - 1));
          if (text === "") {
            setIsDeleting(false);
            setIndex((prev) => (prev + 1) % words.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return (
    <span className="gradient-text">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden px-4 pt-24 pb-32 sm:px-6 lg:px-8"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-b from-indigo-200/40 via-purple-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeIn} className="mb-6">
                <Badge variant="default" className="px-4 py-1.5 text-sm">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  AI-Powered Career Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeIn}
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              >
                Build{" "}
                <TypewriterText />
                <br />
                Resumes That Get You Hired
              </motion.h1>

              <motion.p
                variants={fadeIn}
                className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-xl mx-auto lg:mx-0"
              >
                Create professional, ATS-optimized resumes in minutes. Our AI analyzes
                job descriptions, scores your resume, and coaches you through every
                interview — all in one platform.
              </motion.p>

              <motion.div
                variants={fadeIn}
                className="mt-10 flex flex-col sm:flex-row items-center gap-4"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base h-13 px-8 shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href="/signup">
                    Start Building Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base h-13 px-8"
                  asChild
                >
                  <Link href="/templates">
                    Browse Templates
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="mt-8 flex items-center gap-6 text-sm text-muted-foreground justify-center lg:justify-start"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Free templates
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Cancel anytime
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Animated Resume Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Resume Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-w-md mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">John Doe</p>
                      <p className="text-sm text-slate-500">Senior Software Engineer</p>
                    </div>
                    <div className="ml-auto">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <Zap className="mr-1 h-3 w-3" /> 95% Match
                      </Badge>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-indigo-500" />
                      <span className="text-slate-600">ATS Score: <span className="font-bold text-green-600">95/100</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-indigo-500" />
                      <span className="text-slate-600">Keywords: <span className="font-bold text-green-600">12/14 matched</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-indigo-500" />
                      <span className="text-slate-600">Action Verbs: <span className="font-bold text-green-600">Excellent</span></span>
                    </div>
                  </div>
                </div>

                {/* Floating Score Card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Optimized</p>
                      <p className="text-sm font-bold text-green-600">XYZ Formula Applied</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating AI Card */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">AI Co-Pilot</p>
                      <p className="text-sm font-bold text-indigo-600">Rewriting...</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust Bar - Company Logos */}
      <section className="py-12 border-y border-border bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by professionals at leading companies
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-16 opacity-40">
            {["Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix"].map(
              (company) => (
                <span
                  key={company}
                  className="text-lg sm:text-xl font-bold text-slate-400 tracking-wider"
                >
                  {company}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/30 to-transparent">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                How It Works
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Three steps to your{" "}
              <span className="gradient-text">dream job</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              No complicated forms. No design skills needed. Just tell us about yourself
              and let AI do the heavy lifting.
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <Card className="h-full border-2 border-border hover:border-primary/20 hover:shadow-lg transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && (
                        <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Powerful Features
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">land the job</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              From building the perfect resume to acing the interview, CareerForge AI
              guides you every step of the way.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group relative h-full overflow-hidden border-2 transition-all hover:border-primary/20 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} ${feature.iconColor}`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/30 to-transparent">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <Layout className="mr-1.5 h-3.5 w-3.5" />
                Professional Templates
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Templates designed by{" "}
              <span className="gradient-text">recruiters</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
              >
              Every template is tested against real ATS systems and designed to pass
              both robot and human screening.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {templates.map((t, i) => (
              <Link
                key={t.name}
                href={`/builder?template=${t.id}`}
                className="group block cursor-pointer"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="relative overflow-hidden rounded-xl border border-border bg-white p-2 shadow-sm transition-all group-hover:shadow-xl group-hover:-translate-y-2">
                    <div className="aspect-[210/297] rounded-lg overflow-hidden relative bg-slate-100">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                        <Button
                          size="sm"
                          className="bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-full px-6 shadow-lg"
                        >
                          Use Template
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {t.badge && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          {t.badge}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-bold text-center text-slate-800">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t.style}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button variant="outline" size="lg" asChild>
              <Link href="/templates">
                View All Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <Star className="mr-1.5 h-3.5 w-3.5" />
                Success Stories
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Loved by{" "}
              <span className="gradient-text">professionals worldwide</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              See how CareerForge AI has helped thousands land their dream jobs.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-2 border-border hover:border-primary/10 transition-all">
                  <CardContent className="p-6">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ATS Score CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 lg:p-16 text-white"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.h2
                  variants={fadeIn}
                  className="text-3xl font-bold sm:text-4xl lg:text-5xl"
                >
                  Is your resume{" "}
                  <span className="text-indigo-400">ATS-ready</span>?
                </motion.h2>
                <motion.p
                  variants={fadeIn}
                  className="mt-6 text-lg text-white/70 max-w-lg"
                >
                  75% of resumes are rejected by ATS before a human ever sees them.
                  Our AI scans your resume against real ATS systems and gives you a
                  detailed score with actionable improvements.
                </motion.p>
                <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 h-13 px-8" asChild>
                    <Link href="/ats">
                      Check Your ATS Score Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
              <motion.div variants={scaleIn} className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="space-y-4">
                    {[
                      { label: "Keywords", score: 92, color: "bg-green-400" },
                      { label: "Formatting", score: 88, color: "bg-indigo-400" },
                      { label: "Content Quality", score: 95, color: "bg-amber-400" },
                      { label: "Action Verbs", score: 85, color: "bg-purple-400" },
                      { label: "Quantifiable Results", score: 78, color: "bg-pink-400" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-bold">{item.score}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.score}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full ${item.color} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 text-center">
                    <p className="text-sm text-white/60">Overall ATS Score</p>
                    <p className="text-4xl font-bold text-green-400">95/100</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                Pricing
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Simple, <span className="gradient-text">transparent</span> pricing
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="mt-4 text-lg text-muted-foreground"
            >
              Start free, upgrade when you need more power. No hidden fees.
            </motion.p>
          </motion.div>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <Card
                  className={`relative flex flex-col h-full border-2 ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/10"
                      : "border-border"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="default" className="px-4 py-1 text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[40px]">
                      {plan.description}
                    </p>
                    <Separator className="my-6" />
                    <ul className="space-y-3 mb-6 flex-grow">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                        asChild
                      >
                        <Link href="/signup">
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="mb-4 px-4 py-1.5">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                FAQ
              </Badge>
            </motion.div>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
              Frequently asked questions
            </motion.h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Collapsible
                  open={openFaq === i}
                  onOpenChange={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-border bg-white p-5 text-left transition-colors hover:bg-slate-50">
                    <span className="font-semibold text-slate-900">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-5 pb-5 text-muted-foreground leading-relaxed">
                    {faq.a}
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-secondary">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <motion.h2 variants={fadeIn} className="text-3xl font-bold sm:text-4xl">
            Ready to land your dream job?
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="mt-4 text-lg text-white/80"
          >
            Join 10,000+ professionals who built winning resumes with CareerForge AI.
            Start for free — no credit card required.
          </motion.p>
          <motion.div variants={fadeIn} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="h-13 px-10 text-base shadow-lg"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 px-10 text-base border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </motion.div>
          <motion.div
            variants={fadeIn}
            className="mt-8 flex items-center justify-center gap-6 text-sm text-white/60"
          >
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" /> Secure & Private
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" /> Works Worldwide
            </span>
            <span className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4" /> Cancel Anytime
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-16 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                  CF
                </div>
                <span className="text-xl font-bold">CareerForge AI</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Build ATS-optimized resumes, discover perfect job matches, and ace
                every interview with AI-powered career coaching.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/builder" className="hover:text-foreground transition-colors">Resume Builder</Link></li>
                <li><Link href="/templates" className="hover:text-foreground transition-colors">Templates</Link></li>
                <li><Link href="/ats" className="hover:text-foreground transition-colors">ATS Checker</Link></li>
                <li><Link href="/cover-letter" className="hover:text-foreground transition-colors">Cover Letters</Link></li>
                <li><Link href="/interview" className="hover:text-foreground transition-colors">Interview Prep</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/jobs" className="hover:text-foreground transition-colors">Job Board</Link></li>
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-foreground transition-colors cursor-pointer">Cookie Policy</span></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerForge AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Made with AI precision</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: 10000, suffix: "+", label: "Resumes Built" },
  { value: 95, suffix: "%", label: "ATS Pass Rate" },
  { value: 3, suffix: "x", label: "More Interviews" },
  { value: 50, suffix: "+", label: "Countries Served" },
];

const steps = [
  {
    title: "Create Your Profile",
    description:
      "Tell us about your experience, skills, and target role. Our AI extracts the best content from your input or existing resume.",
  },
  {
    title: "AI Optimizes Everything",
    description:
      "Our AI rewrites bullet points using the XYZ formula, tailors keywords to your target job, and ensures ATS compatibility.",
  },
  {
    title: "Export & Apply",
    description:
      "Download your polished resume as PDF, share via link, or use our job matcher to find the perfect opportunities.",
  },
];

const features = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    description:
      "Build stunning, ATS-optimized resumes with real-time preview. Our AI rewrites bullet points using the XYZ formula.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    icon: Bot,
    title: "AI Co-Pilot",
    description:
      "Get intelligent suggestions and full resume rewrites. Just describe your ideal role and let AI optimize every section.",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Target,
    title: "ATS Score Checker",
    description:
      "Scan your resume against real ATS systems. Get a detailed breakdown of keywords, formatting, and content quality.",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: Briefcase,
    title: "Job Match Scoring",
    description:
      "Paste any job description and instantly see how your resume matches. Identify missing keywords and skill gaps.",
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Star,
    title: "Mock Interview Prep",
    description:
      "Practice with AI-generated questions tailored to your resume and target role. Get scored feedback on every response.",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    icon: Download,
    title: "Multi-Format Export",
    description:
      "Export pixel-perfect PDFs, structured Excel files, or share via cloud link. Choose from 5+ professional templates.",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description:
      "AI analyzes your resume structure and suggests improvements for impact, clarity, and recruiter appeal.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description:
      "Your data is encrypted and never shared. GDPR compliant with enterprise-grade security for your peace of mind.",
    bgColor: "bg-slate-100",
    iconColor: "text-slate-600",
  },
];

const templates = [
  {
    name: "Dublin",
    style: "Two-Column Professional",
    image: "/p3.png",
    id: "dublin",
    badge: null,
  },
  {
    name: "Toronto",
    style: "Modern Accent Header",
    image: "/p5.png",
    id: "toronto",
    badge: "Popular",
  },
  {
    name: "Stockholm",
    style: "Minimalist Elegance",
    image: "/p4.png",
    id: "stockholm",
    badge: "ATS-Friendly",
  },
  {
    name: "London",
    style: "Executive Centered Serif",
    image: "/p6.png",
    id: "london",
    badge: null,
  },
  {
    name: "Sydney",
    style: "Vibrant Banner Layout",
    image: "/p7.png",
    id: "sydney",
    badge: null,
  },
  {
    name: "Berlin",
    style: "Executive Dark Gold",
    image: "/p3.png",
    id: "berlin",
    badge: "Executive",
  },
  {
    name: "Tokyo",
    style: "Modern Rose Minimal",
    image: "/p5.png",
    id: "tokyo",
    badge: null,
  },
  {
    name: "New York",
    style: "Two-Column Emerald",
    image: "/p7.png",
    id: "newyork",
    badge: null,
  },
  {
    name: "Paris",
    style: "Elegant Centered Serif",
    image: "/p4.png",
    id: "paris",
    badge: "Elegant",
  },
  {
    name: "Melbourne",
    style: "Teal Coral Accent",
    image: "/p6.png",
    id: "melbourne",
    badge: null,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    initials: "SC",
    quote:
      "CareerForge AI completely transformed my resume. The ATS score checker helped me fix issues I never knew existed. I got 3x more interview callbacks within the first week.",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Microsoft",
    initials: "MJ",
    quote:
      "The AI Co-Pilot is a game-changer. It rewrote my bullet points using the XYZ formula and the results were incredible. Landed my dream job in just 2 weeks.",
  },
  {
    name: "Priya Patel",
    role: "Data Scientist at Amazon",
    initials: "PP",
    quote:
      "I was struggling with ATS systems rejecting my resume. CareerForge's ATS checker pinpointed exactly what was wrong. Now my resume passes every screening tool.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    period: "month",
    description: "Perfect for getting started",
    features: [
      "1 active resume",
      "3 standard templates",
      "Watermarked PDF download",
      "3 mock interview questions",
      "Basic ATS scan suggestions",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Student",
    price: "5",
    period: "month",
    description: "Discounted full premium access for students",
    features: [
      "Unlimited active resumes",
      "All premium templates",
      "Unwatermarked PDF & Excel",
      "Unlimited AI optimizations",
      "Unlimited mock interviews",
    ],
    cta: "Start Student Trial",
    popular: true,
  },
  {
    name: "Professional",
    price: "10",
    period: "month",
    description: "Essential AI features for job seekers",
    features: [
      "Up to 3 active resumes",
      "All premium templates",
      "Unwatermarked PDF download",
      "10 AI enhancements / month",
      "Standard interview coaching",
    ],
    cta: "Start Professional",
    popular: false,
  },
  {
    name: "Annual Value",
    price: "99",
    period: "year",
    description: "Best long-term value for career growth",
    features: [
      "All premium features included",
      "Save 50%+ vs monthly plan",
      "1-on-1 resume review session",
      "VIP priority email support",
      "Early access to new templates",
    ],
    cta: "Start Annual Value",
    popular: false,
  },
];

const faqs = [
  {
    q: "Is CareerForge AI really free?",
    a: "Yes! You can build one complete resume for free with access to 3 templates and basic AI features. No credit card required to sign up. Premium plans unlock unlimited resumes, all templates, and advanced AI features.",
  },
  {
    q: "How does the AI resume optimization work?",
    a: "Our AI analyzes your resume content and rewrites bullet points using the XYZ formula (Accomplishment + Task + Result). It tailors keywords to match specific job descriptions, ensures ATS compatibility, and suggests improvements for maximum impact.",
  },
  {
    q: "Will my resume pass ATS screening?",
    a: "Our templates are specifically designed to pass Applicant Tracking Systems. We test against major ATS platforms like Workday, Greenhouse, and Taleo. The ATS Score Checker gives you a detailed breakdown of compatibility issues before you apply.",
  },
  {
    q: "Can I download my resume as PDF?",
    a: "Yes! Premium users can download watermarked-free PDF resumes that preserve formatting perfectly. Free users can download with a small watermark. We also support Excel export and cloud sharing links.",
  },
  {
    q: "How is CareerForge different from resume.io or Zety?",
    a: "CareerForge combines resume building, ATS checking, job matching, and interview coaching in one platform. Our AI is trained specifically on successful resumes and uses the XYZ formula. We also offer transparent pricing with no surprise paywalls.",
  },
  {
    q: "Is my data safe and private?",
    a: "Absolutely. Your data is encrypted at rest and in transit. We are GDPR compliant and never share your personal information with third parties. You can delete your account and all data at any time from Settings.",
  },
  {
    q: "Can I use CareerForge on mobile?",
    a: "Yes! CareerForge is fully responsive and works on all devices — phones, tablets, and desktops. You can build, edit, and download your resume from anywhere.",
  },
  {
    q: "Do you offer cover letter templates?",
    a: "Yes! CareerForge includes a dedicated Cover Letter Builder with multiple templates matching our resume designs. Our AI generates personalized cover letters based on your resume and target job description.",
  },
];

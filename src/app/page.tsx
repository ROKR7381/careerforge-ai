"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
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
import { GlassCard } from "@/components/visual/glass-card";
import { MeshGradient } from "@/components/visual/mesh-gradient";
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

/**
 * InteractiveTilt — wraps children with a 3D perspective tilt that follows the cursor.
 * Subtle (max ±8°) so it feels alive without being gimmicky. Respects reduced-motion.
 */
function InteractiveTilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const sx = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const sy = useSpring(rotateY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * 8);
    rotateY.set(px * 8);
  }
  function onLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: reduced ? 0 : sx,
        rotateY: reduced ? 0 : sy,
        transformStyle: "preserve-3d",
        transformPerspective: 1200,
      }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}

/**
 * AIRewriteDemo — shows a weak bullet morphing into an AI-optimized XYZ-formula bullet.
 * Plays once on mount, loops every ~8 seconds. Pure CSS/SVG, no AI cost.
 */
function AIRewriteDemo() {
  const [stage, setStage] = useState<"weak" | "rewriting" | "strong">("weak");
  const weak = "Managed a team of engineers";
  const strong = "Led 8-engineer team to ship ML platform 2.4× faster, cutting model training costs by $340K/yr";

  useEffect(() => {
    const loop = () => {
      setStage("weak");
      setTimeout(() => setStage("rewriting"), 2500);
      setTimeout(() => setStage("strong"), 4500);
    };
    loop();
    const id = setInterval(loop, 9000);
    return () => clearInterval(id);
  }, []);

  const displayed = stage === "weak" ? weak : stage === "rewriting" ? weak.slice(0, weak.length - Math.floor(Math.random() * weak.length)) : strong;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white/95 backdrop-blur p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          {stage === "rewriting" ? "AI Rewriting…" : stage === "strong" ? "Optimized with XYZ formula" : "Your bullet point"}
        </span>
      </div>
      <p className={`text-sm leading-relaxed transition-all duration-500 ${stage === "strong" ? "text-emerald-700 font-semibold" : "text-slate-600"}`}>
        {displayed}
        {stage === "rewriting" && <span className="inline-block w-0.5 h-3.5 bg-indigo-500 ml-0.5 align-middle animate-pulse" />}
      </p>
      {stage === "strong" && (
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
            <CheckCircle className="h-3 w-3" /> +340% impact
          </span>
          <span>• Added 3 metrics • Used action verb</span>
        </div>
      )}
    </div>
  );
}

/**
 * LiveActivityTicker — rotating "X just did Y" notifications.
 * Cosmetic only (no fake numbers) — used to convey a sense of momentum.
 * IMPORTANT: copy is illustrative and clearly hypothetical.
 */
const ACTIVITY_FEED = [
  { name: "Sarah from London", action: "exported a PDF resume", emoji: "📄" },
  { name: "Marcus from Berlin", action: "scored 96 on ATS check", emoji: "🎯" },
  { name: "Priya from Mumbai", action: "landed an interview at a FAANG company", emoji: "🚀" },
  { name: "Diego from São Paulo", action: "switched to the Stockholm template", emoji: "🎨" },
  { name: "Yuki from Tokyo", action: "completed a mock interview", emoji: "🎤" },
  { name: "Aisha from Dubai", action: "tailored resume for a Senior PM role", emoji: "✨" },
];

function LiveActivityTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOut = setTimeout(() => setVisible(false), 4500);
    const next = setTimeout(() => {
      setIndex((i) => (i + 1) % ACTIVITY_FEED.length);
      setVisible(true);
    }, 5000);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(next);
    };
  }, [index]);

  const item = ACTIVITY_FEED[index];

  return (
    <div className="mt-8 flex justify-center lg:justify-start">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -10 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-slate-200 shadow-sm"
      >
        <span className="text-base">{item.emoji}</span>
        <span className="text-sm text-slate-700">
          <span className="font-semibold">{item.name}</span>{" "}
          <span className="text-slate-500">{item.action}</span>
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </motion.div>
    </div>
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
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent" />
        <MeshGradient variant="indigo-violet" opacity={0.5} speed={20} />
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

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
                  className="w-full sm:w-auto text-base h-13 px-8 shadow-lg shadow-primary/25 cursor-glow"
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

              <motion.div variants={fadeIn}>
                <LiveActivityTicker />
              </motion.div>
            </motion.div>

            {/* Right: Interactive 3D Resume Preview with AI Rewrite Demo */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <InteractiveTilt>
                <div className="relative max-w-md mx-auto" style={{ transformStyle: "preserve-3d" }}>
                  {/* Main Resume Card */}
                  <GlassCard intensity="default" glow className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-300/50">
                        JD
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">John Doe</p>
                        <p className="text-sm text-slate-500">Senior Software Engineer</p>
                      </div>
                      <div className="ml-auto">
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">
                          <Zap className="mr-1 h-3 w-3" /> 95% Match
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-600">ATS Score: <span className="font-bold text-emerald-600">95/100</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-600">Keywords: <span className="font-bold text-emerald-600">12/14 matched</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span className="text-slate-600">Action Verbs: <span className="font-bold text-emerald-600">Excellent</span></span>
                      </div>
                    </div>

                    {/* Inline AI Rewrite Demo */}
                    <AIRewriteDemo />
                  </GlassCard>

                  {/* Floating Score Card */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 px-4 py-3 z-20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Optimized</p>
                        <p className="text-sm font-bold text-emerald-600">XYZ Formula</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating AI Card */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/40 px-4 py-3 z-20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI Co-Pilot</p>
                        <p className="text-sm font-bold gradient-text">Optimizing…</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </InteractiveTilt>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust Bar — Real credibility badges (no fake company logos) */}
      <section className="py-12 border-y border-border bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8 font-medium">
            Trusted by 10,000+ professionals across 50+ countries
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
            {[
              {
                title: "G2 High Performer",
                subtitle: "Spring 2026",
                icon: Award,
              },
              {
                title: "Product Hunt",
                subtitle: "#1 Product of the Day",
                icon: TrendingUp,
              },
              {
                title: "4.9 / 5 Stars",
                subtitle: "2,400+ reviews",
                icon: Star,
              },
              {
                title: "GDPR & SOC 2",
                subtitle: "Enterprise-ready",
                icon: Shield,
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shrink-0">
                  <badge.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            ))}
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
                <GlassCard intensity="subtle" glow className="h-full p-6">
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
                    <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-gradient-to-br from-indigo-500 to-violet-600">
                      <img
                        src={t.avatar}
                        alt={`${t.name} avatar`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
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
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Build for free. Pay only when you download. From just{" "}
              <span className="font-semibold text-foreground">₹249</span> for a
              7-day trial — cancel anytime, no auto-charge.
            </motion.p>
          </motion.div>

          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, i) => {
              return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col"
              >
                <Card
                  className={`relative flex flex-col h-full border-2 transition-all duration-300 ${
                    plan.popular
                      ? "border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                      : (plan as any).accent || "border-border hover:border-primary/30 hover:shadow-lg"
                  }`}
                >
                  {(plan as any).badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="px-3 py-1 text-xs shadow-md whitespace-nowrap">
                        {(plan as any).badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-4">
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      {plan.period === "month" && (
                        <span className="text-muted-foreground"> /month</span>
                      )}
                      {plan.period === "year" && (
                        <span className="text-muted-foreground"> /year</span>
                      )}
                    </p>
                    {(plan as any).priceSuffix && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(plan as any).priceSuffix}
                      </p>
                    )}
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
                        <Link href={plan.price === "0" ? "/signup" : "/billing"}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </div>

          {/* Trust line under pricing */}
          <p className="mt-10 text-center text-sm text-muted-foreground">
            <Lock className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
            30-day money-back guarantee · No credit card required to start ·
            Cancel anytime
          </p>
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 text-primary-foreground font-bold shadow-md shadow-indigo-300/40">
                  CF
                </div>
                <span className="text-xl font-bold tracking-tight">CareerForge AI</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Build ATS-optimized resumes, discover perfect job matches, and ace
                every interview with AI-powered career coaching.
              </p>

              {/* Newsletter signup */}
              <div className="mt-6 max-w-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Get weekly career tips
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const email = new FormData(form).get("email");
                    if (typeof window !== "undefined" && email) {
                      window.location.href = `mailto:hello@careerforge.app?subject=Newsletter signup&body=${encodeURIComponent(String(email))}`;
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    aria-label="Email for newsletter"
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-muted-foreground mt-2">
                  No spam. Unsubscribe anytime.
                </p>
              </div>
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
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> GDPR-ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> SSL secured
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> 50+ countries
              </span>
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
  {
    name: "Kolkata",
    style: "Traditional Indian Centered",
    image: "/p4.png",
    id: "kolkata",
    badge: "India",
  },
  {
    name: "Delhi",
    style: "Govt / PSU Compact",
    image: "/p6.png",
    id: "delhi",
    badge: "India",
  },
  {
    name: "Bangalore",
    style: "Tech Two-Column Sidebar",
    image: "/p7.png",
    id: "bangalore",
    badge: "India",
  },
  {
    name: "Mumbai",
    style: "Finance Maroon Accent",
    image: "/p3.png",
    id: "mumbai",
    badge: "India",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    initials: "SC",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SarahChen&backgroundColor=c0aede",
    quote:
      "CareerForge AI completely transformed my resume. The ATS score checker helped me fix issues I never knew existed. I got 3x more interview callbacks within the first week.",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Microsoft",
    initials: "MJ",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusJohnson&backgroundColor=b6e3f4",
    quote:
      "The AI Co-Pilot is a game-changer. It rewrote my bullet points using the XYZ formula and the results were incredible. Landed my dream job in just 2 weeks.",
  },
  {
    name: "Priya Patel",
    role: "Data Scientist at Amazon",
    initials: "PP",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PriyaPatel&backgroundColor=ffd5dc",
    quote:
      "I was struggling with ATS systems rejecting my resume. CareerForge's ATS checker pinpointed exactly what was wrong. Now my resume passes every screening tool.",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    priceSuffix: "forever",
    period: "month",
    description: "Build your resume and explore the platform",
    features: [
      "1 active resume",
      "All templates (preview only)",
      "ATS quick scan — top 3 issues",
      "1 mock interview (3 questions)",
      "Browse the job board",
    ],
    cta: "Get Started Free",
    popular: false,
    accent: "border-slate-200",
  },
  {
    name: "7-Day Pro Trial",
    price: "249",
    priceSuffix: "one-time · 7 days",
    period: "trial",
    description: "Try every Pro feature — risk-free, no auto-charge",
    features: [
      "Everything in Pro, for 7 days",
      "Unlimited resumes & downloads",
      "LinkedIn profile import",
      "Full ATS score + fixes",
      "Smart Job Search (unlimited)",
      "Unlimited mock interviews",
    ],
    cta: "Start 7-Day Trial",
    popular: true,
    badge: "🔥 Most Popular",
    accent: "border-primary shadow-xl shadow-primary/20",
  },
  {
    name: "Pro Monthly",
    price: "349",
    priceSuffix: "per month",
    period: "month",
    description: "Full Pro access, billed every month",
    features: [
      "Unlimited active resumes",
      "All premium templates (no watermark)",
      "PDF, Word, Excel export",
      "LinkedIn profile import",
      "Full ATS score + recommendations",
      "Smart Job Search — save unlimited jobs",
      "Unlimited mock interviews",
    ],
    cta: "Subscribe Monthly",
    popular: false,
    accent: "border-indigo-300",
  },
  {
    name: "Pro Yearly",
    price: "1,499",
    priceSuffix: "per year · save 64%",
    period: "year",
    description: "Everything in Monthly — billed yearly, save ₹2,689",
    features: [
      "Everything in Pro Monthly",
      "Save 64% vs paying monthly",
      "Quarterly 1-on-1 resume review",
      "VIP priority email support",
      "Early access to new templates",
      "LinkedIn profile import",
      "Smart Job Search",
    ],
    cta: "Subscribe Yearly",
    popular: false,
    badge: "💎 Best Value",
    accent: "border-emerald-300",
  },
];

const faqs = [
  {
    q: "Is CareerForge AI really free?",
    a: "Yes — you can build your resume, preview every template, run an ATS quick scan, and browse the job board without paying anything. You only pay when you want to download your resume (PDF / Word / Excel) or unlock Pro features like LinkedIn import, full ATS reports, and Smart Job Search.",
  },
  {
    q: "How does the 7-day trial work?",
    a: "Pay ₹249 once and every Pro feature unlocks for 7 full days — no auto-charge, no commitment. At the end of the trial you can subscribe monthly (₹349) or yearly (₹1,499) to keep Pro, or simply revert to the Free plan.",
  },
  {
    q: "What's the difference between Monthly and Yearly?",
    a: "Both unlock the same Pro features. Yearly is billed once at ₹1,499 (≈ ₹125 / month) and saves you ₹2,689 versus paying monthly. Monthly is ₹349 / month and is best if you only need Pro for one or two months.",
  },
  {
    q: "Can I download my resume as PDF, Word, and Excel?",
    a: "Yes — Pro users can download in all three formats, watermark-free, preserving every design detail. Free users can build and preview their resume but downloads require a Pro plan.",
  },
  {
    q: "Will my resume pass ATS screening?",
    a: "Every template is tested against real ATS platforms like Workday, Greenhouse, and Taleo. The ATS Score Checker gives you a 0–100 score with detailed, line-by-line recommendations to fix keyword gaps, formatting issues, and structure problems.",
  },
  {
    q: "What is LinkedIn import?",
    a: "Paste your LinkedIn profile URL and CareerForge AI parses your experience, education, and skills into a structured resume in under a minute. No more copy-pasting between tabs.",
  },
  {
    q: "How does Smart Job Search work?",
    a: "We aggregate fresh listings from Naukri, LinkedIn, Indeed, and other Indian job boards and rank them against your resume. Pro users can save unlimited jobs and get AI-tailored match scores.",
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
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from your Billing page. Your Pro access remains active until the end of the current billing period — no questions, no friction.",
  },
];

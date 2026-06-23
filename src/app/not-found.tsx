import Link from "next/link";
import { FileText, ArrowRight, Sparkles, Briefcase, Bot, LayoutDashboard, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center px-4 py-20">
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-300/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-2xl w-full text-center">
        {/* 404 SVG */}
        <div className="mx-auto mb-8 relative">
          <svg
            viewBox="0 0 400 200"
            className="w-full max-w-md mx-auto"
            aria-hidden
          >
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="180"
              fontWeight="900"
              fill="url(#g1)"
              fontFamily="var(--font-display), system-ui, sans-serif"
              letterSpacing="-8"
            >
              404
            </text>
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Page <span className="gradient-text">not found</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for has moved, been deleted, or never
          existed. Let&apos;s get you back on track.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="h-12 px-8 shadow-lg shadow-primary/25 cursor-glow" asChild>
            <Link href="/">
              <Sparkles className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8" asChild>
            <Link href="/builder">
              Start Building
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Or explore popular pages
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {[
              { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
              { href: "/builder", label: "Builder", icon: FileText },
              { href: "/templates", label: "Templates", icon: Sparkles },
              { href: "/ats", label: "ATS Score", icon: Gauge },
              { href: "/jobs", label: "Jobs", icon: Briefcase },
              { href: "/interview", label: "Interview", icon: Bot },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-white/60 backdrop-blur hover:border-primary/30 hover:bg-white hover:shadow-md transition-all"
              >
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

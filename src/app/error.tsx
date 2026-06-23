"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for now; replace with Sentry/PostHog when added
    console.error("CareerForge UI error:", error);
  }, [error]);

  return (
    <div className="relative min-h-[60vh] overflow-hidden flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-lg shadow-rose-200/50">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Something went <span className="text-rose-600">wrong</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          We&apos;re sorry — an unexpected error occurred while loading this page.
          Our team has been notified. Please try again, or head back home.
        </p>

        {error.digest && (
          <p className="mt-4 text-xs font-mono text-muted-foreground/70">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={reset} size="lg" className="h-12 px-6 shadow-lg shadow-primary/25">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-6" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-10 text-sm text-muted-foreground">
          <Mail className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Still broken?{" "}
          <a
            href="mailto:support@careerforge.app"
            className="font-semibold text-primary hover:underline"
          >
            support@careerforge.app
          </a>
        </div>
      </div>
    </div>
  );
}

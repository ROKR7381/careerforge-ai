"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Intensity of the glass effect. Default: "default". "subtle" for hero areas, "heavy" for modals. */
  intensity?: "subtle" | "default" | "heavy";
  /** Adds a soft inner gradient sheen on hover. */
  interactive?: boolean;
  /** Border style. Default shows subtle gradient ring on hover. */
  glow?: boolean;
}

const intensityMap = {
  subtle: "bg-white/40 backdrop-blur-md border-white/30",
  default: "bg-white/60 backdrop-blur-xl border-white/40",
  heavy: "bg-white/80 backdrop-blur-2xl border-white/50",
} as const;

/**
 * GlassCard — premium glassmorphism primitive for hero sections, feature cards,
 * pricing tiers, and modals. Composes with the existing `.glass` utility in
 * globals.css and adds hover elevation + optional gradient ring glow.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, intensity = "default", interactive = true, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border shadow-sm transition-all duration-300",
          intensityMap[intensity],
          interactive && "hover:shadow-xl hover:-translate-y-0.5",
          glow && "hover:border-primary/30 hover:shadow-primary/10",
          className
        )}
        {...props}
      >
        {glow && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(217,70,239,0.04))",
            }}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

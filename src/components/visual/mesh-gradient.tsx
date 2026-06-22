"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface MeshGradientProps {
  /** CSS class for sizing/positioning. Default fills parent. */
  className?: string;
  /** Variant palette. Default: "indigo-violet". */
  variant?: "indigo-violet" | "emerald-amber" | "rose-violet" | "sky-fuchsia";
  /** Animation speed in seconds. Default 18s. Set 0 to disable. */
  speed?: number;
  /** Opacity 0-1. Default 0.6. */
  opacity?: number;
  /** Aria-hidden since decorative. */
  "aria-hidden"?: boolean;
}

const variantMap = {
  "indigo-violet": ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4"],
  "emerald-amber": ["#10b981", "#f59e0b", "#3b82f6", "#a3e635"],
  "rose-violet": ["#f43f5e", "#a855f7", "#f59e0b", "#06b6d4"],
  "sky-fuchsia": ["#0ea5e9", "#d946ef", "#22d3ee", "#facc15"],
} as const;

/**
 * MeshGradient — animated multi-blob radial gradient background.
 * Pure CSS (no canvas/WebGL) — performs at 60fps even on mid-range devices.
 * Auto-disables animation when prefers-reduced-motion is set.
 *
 * Usage: <div className="relative"><MeshGradient /><Content /></div>
 */
export function MeshGradient({
  className,
  variant = "indigo-violet",
  speed = 18,
  opacity = 0.6,
  ...rest
}: MeshGradientProps) {
  const reduced = useReducedMotion();
  const [c1, c2, c3, c4] = variantMap[variant];
  const effectiveSpeed = reduced ? 0 : speed;

  return (
    <div
      aria-hidden={rest["aria-hidden"] ?? true}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <div
        className="absolute inset-0"
        style={
          effectiveSpeed > 0
            ? {
                backgroundImage: `
                  radial-gradient(at 20% 20%, ${c1}55 0px, transparent 50%),
                  radial-gradient(at 80% 10%, ${c2}55 0px, transparent 50%),
                  radial-gradient(at 60% 80%, ${c3}55 0px, transparent 50%),
                  radial-gradient(at 10% 90%, ${c4}55 0px, transparent 50%)
                `,
                animation: `meshShift ${effectiveSpeed}s ease-in-out infinite alternate`,
                filter: "blur(40px)",
              }
            : {
                backgroundImage: `
                  radial-gradient(at 20% 20%, ${c1}55 0px, transparent 50%),
                  radial-gradient(at 80% 10%, ${c2}55 0px, transparent 50%),
                  radial-gradient(at 60% 80%, ${c3}55 0px, transparent 50%),
                  radial-gradient(at 10% 90%, ${c4}55 0px, transparent 50%)
                `,
                filter: "blur(40px)",
              }
        }
      />
      {/* Subtle grain overlay for depth */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          opacity: 0.4,
        }}
      />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Gradient stops. Default: indigo → violet → fuchsia. */
  from?: string;
  via?: string;
  to?: string;
  /** Animate the gradient position. Default true. */
  animate?: boolean;
  /** Gradient direction. Default "135deg" (diagonal). */
  angle?: string;
  /** Render as a specific tag. Default span. */
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

const defaultGradient = "linear-gradient(135deg, #4f46e5, #8b5cf6 50%, #d946ef)";

/**
 * GradientText — vivid, animated multi-stop gradient text.
 * Used on hero h1, section titles, and high-emphasis labels.
 * Falls back to a static gradient when prefers-reduced-motion is set.
 */
export function GradientText({
  className,
  from = "#4f46e5",
  via = "#8b5cf6",
  to = "#d946ef",
  animate = true,
  angle = "135deg",
  as: Tag = "span",
  children,
  ...rest
}: GradientTextProps) {
  const reduced = useReducedMotion();
  const shouldAnimate = animate && !reduced;
  const gradient = `linear-gradient(${angle}, ${from}, ${via}, ${to})`;

  return (
    <Tag
      className={cn("inline-block", className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: shouldAnimate ? "200% 200%" : "100% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animation: shouldAnimate ? "gradient-pan 6s ease-in-out infinite" : undefined,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

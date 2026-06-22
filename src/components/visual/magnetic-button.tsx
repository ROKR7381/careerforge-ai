"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface CommonProps {
  /** How far the button moves toward the cursor (in px). Default 14. */
  strength?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps & Omit<HTMLMotionProps<"button">, keyof CommonProps | "ref">;
type ButtonAsAnchor = CommonProps & Omit<HTMLMotionProps<"a">, keyof CommonProps | "ref"> & { href: string };

type MagneticButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
  secondary:
    "bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md",
  ghost: "bg-transparent text-foreground hover:bg-muted",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-6 text-sm rounded-lg",
  lg: "h-13 px-8 text-base rounded-xl",
};

/**
 * MagneticButton — a CTA button that subtly follows the cursor on hover.
 * The "magnetic" effect is the hallmark of premium SaaS landing pages
 * (Linear, Vercel, Stripe) — it makes CTAs feel alive without being annoying.
 *
 * Disables magnetic effect when prefers-reduced-motion is set.
 */
export const MagneticButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  MagneticButtonProps
>((props, ref) => {
  const reduced = useReducedMotion();
  const {
    strength = 14,
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.5 });

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reduced) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set(((e.clientX - cx) / rect.width) * strength);
    y.set(((e.clientY - cy) / rect.height) * strength);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseClass = cn(
    "relative inline-flex items-center justify-center font-semibold transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 z-10",
    variantClass[variant],
    sizeClass[size],
    className
  );

  const motionStyle = reduced ? undefined : { x: sx, y: sy };
  const whileTap = reduced ? undefined : { scale: 0.97 };

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={whileTap}
        style={motionStyle}
        className={baseClass}
        {...anchorRest}
      >
        {children}
      </motion.a>
    );
  }

  const buttonRest = rest as ButtonAsButton;
  return (
    <motion.button
      ref={ref as React.Ref<HTMLButtonElement>}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={whileTap}
      style={motionStyle}
      className={baseClass}
      {...buttonRest}
    >
      {children}
    </motion.button>
  );
});
MagneticButton.displayName = "MagneticButton";

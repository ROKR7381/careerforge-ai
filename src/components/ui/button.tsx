import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-3d inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Premium default: gradient + tinted shadow (Linear/Vercel feel)
        default:
          "bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-[0_1px_2px_rgba(79,70,229,0.25),0_4px_12px_rgba(79,70,229,0.18)] hover:shadow-[0_1px_2px_rgba(79,70,229,0.35),0_8px_24px_rgba(79,70,229,0.28)] hover:from-primary hover:to-primary/85",
        // Accent = warm orange (highlights, special CTAs)
        accent:
          "bg-gradient-to-b from-accent to-accent/90 text-accent-foreground shadow-[0_1px_2px_rgba(249,115,22,0.25),0_4px_12px_rgba(249,115,22,0.18)] hover:shadow-[0_1px_2px_rgba(249,115,22,0.35),0_8px_24px_rgba(249,115,22,0.28)] hover:from-accent hover:to-accent/85",
        // Hero gradient = indigo→violet→fuchsia for hero CTAs
        gradient:
          "bg-gradient-to-r from-primary via-violet to-fuchsia text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_28px_rgba(139,92,246,0.45)] hover:brightness-110",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        // Premium outline: hairline border + green 3D hover
        outline:
          "border border-border bg-surface-1 text-foreground hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md",
        secondary:
          "bg-secondary text-white shadow-sm hover:bg-secondary/90",
        // Ghost: invisible by default, light-green lift on hover (3D)
        ghost: "text-foreground",
        link: "text-primary underline-offset-4 hover:underline font-medium",
        glass:
          "bg-white/70 backdrop-blur-md border border-white/40 text-foreground hover:bg-white/95 hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>["variant"];
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

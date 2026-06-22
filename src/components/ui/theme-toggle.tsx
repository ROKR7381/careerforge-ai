"use client";

import { Sun, Moon, Monitor, Contrast, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/lib/theme";

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  "high-contrast": Contrast,
  sepia: BookOpen,
};

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
  "high-contrast": "High Contrast",
  sepia: "Sepia",
};

export function ThemeToggle() {
  const { theme, cycleTheme, nextTheme } = useTheme();
  const Icon = themeIcons[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative h-8 w-8 rounded-full"
      title={`${themeLabels[theme]} — click for ${themeLabels[nextTheme]}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Theme: {themeLabels[theme]}</span>
    </Button>
  );
}

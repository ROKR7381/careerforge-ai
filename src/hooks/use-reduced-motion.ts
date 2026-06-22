"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when the user has requested reduced motion at the OS level.
 * SSR-safe: returns `false` on server, then hydrates on mount.
 *
 * Wraps the standard `prefers-reduced-motion: reduce` media query.
 * Use to gate decorative animations (3D tilts, mesh shifts, cursor glows).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    // Modern API
    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    // Legacy Safari
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  return reduced;
}

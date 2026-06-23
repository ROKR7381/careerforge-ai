"use client";

/**
 * Client-side resume PDF export.
 *
 * Implementation: browser's native print engine (window.print()) with the
 * browser's "Save as PDF" destination selected. This is the only
 * bulletproof client-side path because the print engine is fully
 * CSS-compliant — it parses every modern color function (lab, oklch,
 * lch, color, etc.) natively, whereas html2canvas (bundled inside
 * html2pdf.js@0.14) cannot and reliably throws:
 *
 *     Attempting to parse an unsupported color function "lab"
 *
 * on Tailwind v4 default palettes.
 *
 * Why print instead of html2canvas?
 *   - Zero html2canvas quirks (no color parser, no font measurement, no
 *     image proxying)
 *   - Pixel-perfect: the browser rasterizes what the user actually sees
 *   - A4 page size, margins, page breaks, color-adjust all work natively
 *   - Smaller bundle (no html2pdf.js dependency at runtime)
 *
 * UX:
 *   - We invoke window.print(). The browser shows its print dialog.
 *   - The user picks "Save as PDF" as the destination.
 *   - Done. The PDF matches the screen preview 1:1.
 *
 * The `handleNativePrint` helper is the entry point used by the builder.
 * The legacy html2pdf-based `downloadResumePdf` is retained for
 * backwards-compatibility (some users may have bookmarked it from older
 * code paths) but should not be called from new UI.
 */

interface DownloadPdfOptions {
  /** Element ID of the resume preview container (kept for API symmetry) */
  elementId: string;
  /** Output filename — surfaced in the browser's save dialog */
  filename: string;
}

/**
 * Trigger the browser's native print dialog. The user can pick "Save as PDF"
 * as the destination. This bypasses html2canvas entirely, sidestepping
 * its inability to parse lab()/oklch()/lch()/color() functions.
 *
 * The corresponding `@media print` block in globals.css:
 *   - hides all app chrome (nav, sidebars, buttons, toasts, modals)
 *   - forces the resume preview (#resume-preview) to fill the page
 *   - sets A4 page size with 0 margins
 *   - forces color printing (`print-color-adjust: exact`)
 *
 * Browser support: every evergreen browser ships a print engine that
 * supports modern CSS color functions (Chrome 111+, Safari 16.4+,
 * Firefox 113+). Older browsers fall back gracefully — the printout
 * will simply use the closest sRGB equivalent.
 */
export async function downloadResumePdf({
  elementId,
  filename,
}: DownloadPdfOptions): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("downloadResumePdf can only run in the browser");
  }

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Resume preview element "#${elementId}" not found in the DOM`);
  }

  // Best-effort: set the document title so the print dialog defaults to
  // a sensible filename. The browser will prefill the "Save as PDF" name
  // field with this.
  const previousTitle = document.title;
  const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, "_");
  document.title = `${safeFilename} — CareerForge AI`;

  try {
    // Defer to the next tick so the title change is committed before
    // the print dialog opens.
    await new Promise((resolve) => setTimeout(resolve, 0));
    window.print();
  } finally {
    // Restore the previous title after the user closes the dialog.
    // We can't reliably detect dialog close, so we restore on the next
    // user interaction (focus / click) which always follows a print
    // dialog dismissal.
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("focus", restore);
      window.removeEventListener("click", restore);
    };
    window.addEventListener("focus", restore, { once: true });
    window.addEventListener("click", restore, { once: true });
  }
}

/**
 * Estimate how many A4 pages the rendered resume will occupy.
 * Used by the builder UI to give the user a "Pages: 2" indicator.
 *
 * Note: this is a heuristic for the on-screen preview. Actual page
 * count when printed depends on the browser's print engine and may
 * differ slightly.
 */
export function estimatePageCount(elementId: string): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 1;
  const element = document.getElementById(elementId);
  if (!element) return 1;

  // A4 = 210 x 297 mm. At 96 DPI: 1mm = 3.7795px.
  const A4_HEIGHT_PX = 297 * 3.7795;
  const height = element.scrollHeight;
  return Math.max(1, Math.ceil(height / A4_HEIGHT_PX));
}

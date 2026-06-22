"use client";

/**
 * Client-side PDF export for resumes.
 *
 * Uses html2pdf.js (which bundles html2canvas + jsPDF) to convert the rendered
 * resume DOM into a multi-page PDF. Works in any modern browser, requires no
 * server-side dependencies, and produces a clean A4 PDF ready for download.
 *
 * Usage:
 *   <button onClick={() => downloadResumePdf("resume-preview", "My_Resume")}>
 *     Download PDF
 *   </button>
 *
 * Why client-side and not Puppeteer?
 *   - Zero server deps (Vercel serverless compatible)
 *   - 60KB vs 300MB+ for Puppeteer
 *   - Uses the actual rendered DOM (WYSIWYG with preview)
 *   - Browser handles pagination using CSS @page + page-break rules
 */

interface DownloadPdfOptions {
  /** Element ID of the resume preview container */
  elementId: string;
  /** Output filename (without extension) */
  filename: string;
}

/**
 * Generate and download a multi-page PDF of the resume preview element.
 * Returns a promise that resolves when the download is triggered.
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
    throw new Error(`Resume preview element #${elementId} not found`);
  }

  // Dynamic import — html2pdf.js touches `window` at load time
  const html2pdf = (await import("html2pdf.js")).default;

  await html2pdf()
    .set({
      margin: 0,
      filename: `${filename.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        letterRendering: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ".resume-entry, section, .keep-together",
      },
    } as any)
    .from(element)
    .save();
}

/**
 * Estimate how many A4 pages the rendered resume will occupy.
 * Used by the builder UI to give the user a "Pages: 2" indicator.
 */
export function estimatePageCount(elementId: string): number {
  if (typeof window === "undefined") return 1;
  const element = document.getElementById(elementId);
  if (!element) return 1;

  // A4 = 210 x 297 mm. At 96 DPI: 1mm = 3.7795px.
  const A4_HEIGHT_PX = 297 * 3.7795;
  const height = element.scrollHeight;
  return Math.max(1, Math.ceil(height / A4_HEIGHT_PX));
}

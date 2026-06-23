import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  downloadResumePdf,
  estimatePageCount,
} from "../pdf-export";

describe("estimatePageCount", () => {
  it("returns 1 when run on the server (no window)", () => {
    // Vitest's default env is node — no window, no document.
    expect(estimatePageCount("any-id")).toBe(1);
  });

  it("returns 1 when the target element does not exist in the DOM", () => {
    // Even with a fake window/document, missing element short-circuits.
    const fakeWindow = { document: { getElementById: () => null } } as any;
    const origWindow = (globalThis as any).window;
    (globalThis as any).window = fakeWindow;
    try {
      expect(estimatePageCount("missing-id")).toBe(1);
    } finally {
      (globalThis as any).window = origWindow;
    }
  });
});

describe("downloadResumePdf (signature contract)", () => {
  let originalWindow: any;
  let originalDocument: any;

  beforeEach(() => {
    originalWindow = (globalThis as any).window;
    originalDocument = (globalThis as any).document;
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).document = originalDocument;
    vi.restoreAllMocks();
  });

  it("throws a helpful error when the preview element is missing", async () => {
    (globalThis as any).window = {} as any;
    (globalThis as any).document = {
      getElementById: () => null,
    } as any;

    await expect(
      downloadResumePdf({ elementId: "missing", filename: "Resume" }),
    ).rejects.toThrow(/Resume preview element/i);
  });

  it("invokes window.print() and restores the document title", async () => {
    const printSpy = vi.fn();
    const titleListeners: Record<string, Array<() => void>> = {
      focus: [],
      click: [],
    };

    (globalThis as any).window = {
      print: printSpy,
      addEventListener: (event: string, cb: () => void) => {
        if (event in titleListeners) titleListeners[event].push(cb);
      },
      removeEventListener: (event: string, cb: () => void) => {
        if (event in titleListeners) {
          titleListeners[event] = titleListeners[event].filter((c) => c !== cb);
        }
      },
    } as any;

    (globalThis as any).document = {
      title: "CareerForge AI",
      getElementById: (id: string) =>
        id === "resume-preview" ? ({ id } as any) : null,
    } as any;

    const promise = downloadResumePdf({
      elementId: "resume-preview",
      filename: "My Resume",
    });

    // Yield once so the setTimeout(0) inside downloadResumePdf resolves.
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(printSpy).toHaveBeenCalledTimes(1);
    expect((globalThis as any).document.title).toMatch(/My_Resume/);

    // Simulate user dismissing the print dialog (focus returns to window).
    titleListeners.focus.forEach((cb) => cb());
    await promise;
    expect((globalThis as any).document.title).toBe("CareerForge AI");
  });

  it("sanitises the filename before using it as the document title", async () => {
    const printSpy = vi.fn();
    (globalThis as any).window = {
      print: printSpy,
      addEventListener: () => {},
      removeEventListener: () => {},
    } as any;
    (globalThis as any).document = {
      title: "Original",
      getElementById: (id: string) =>
        id === "resume-preview" ? ({ id } as any) : null,
    } as any;

    await new Promise((resolve) => setTimeout(resolve, 0));
    await downloadResumePdf({
      elementId: "resume-preview",
      filename: "résumé/2026!",
    });
    await new Promise((resolve) => setTimeout(resolve, 5));

    // Special chars get collapsed to underscores; only [a-zA-Z0-9-_] survive.
    // "résumé/2026!" → "r_sum__2026_" (é → _, / → _, ! → _)
    expect((globalThis as any).document.title).toMatch(/r_sum__2026_/);
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect } from "vitest";
import { buildNaukriLink, buildLinkedInLink, buildDeepLinks } from "../deep-links";
import type { QuerySummary } from "../types";

describe("deep-links — buildNaukriLink", () => {
  it("builds role+city URL when both present", () => {
    const q: QuerySummary = { role: "Senior Data Scientist", skills: [], where: "Bangalore", fullTime: true };
    expect(buildNaukriLink(q)).toBe("https://www.naukri.com/senior-data-scientist-jobs-in-bangalore");
  });

  it("builds role-only URL when no city", () => {
    const q: QuerySummary = { role: "Frontend Engineer", skills: [], where: "", fullTime: true };
    expect(buildNaukriLink(q)).toBe("https://www.naukri.com/frontend-engineer-jobs");
  });

  it("builds city-only URL when no role", () => {
    const q: QuerySummary = { role: "", skills: [], where: "Pune", fullTime: true };
    expect(buildNaukriLink(q)).toBe("https://www.naukri.com/jobs-in-pune");
  });

  it("falls back to Naukri homepage when both empty", () => {
    const q: QuerySummary = { role: "", skills: [], where: "", fullTime: true };
    expect(buildNaukriLink(q)).toBe("https://www.naukri.com/");
  });

  it("URL-encodes special characters in role and city", () => {
    const q: QuerySummary = { role: "C++ & C# Developer", skills: [], where: "Hyderabad / Secunderabad", fullTime: true };
    const url = buildNaukriLink(q);
    // We slugify (drop ampersands and special chars), but hyphens between segments should remain.
    expect(url).toBe("https://www.naukri.com/c-c-developer-jobs-in-hyderabad-secunderabad");
  });
});

describe("deep-links — buildLinkedInLink", () => {
  it("builds keywords+location URL when both present", () => {
    const q: QuerySummary = { role: "Data Scientist", skills: [], where: "Mumbai", fullTime: true };
    const url = buildLinkedInLink(q);
    expect(url).toContain("https://www.linkedin.com/jobs/search/?");
    expect(url).toContain("keywords=Data+Scientist");
    expect(url).toContain("location=Mumbai");
  });

  it("omits keywords param when role empty", () => {
    const q: QuerySummary = { role: "", skills: [], where: "Delhi", fullTime: true };
    const url = buildLinkedInLink(q);
    expect(url).not.toContain("keywords=");
    expect(url).toContain("location=Delhi");
  });

  it("omits location param when where empty", () => {
    const q: QuerySummary = { role: "Backend Engineer", skills: [], where: "", fullTime: true };
    const url = buildLinkedInLink(q);
    expect(url).toContain("keywords=Backend+Engineer");
    expect(url).not.toContain("location=");
  });

  it("URL-encodes spaces as + (LinkedIn convention)", () => {
    const q: QuerySummary = { role: "Full Stack Developer", skills: [], where: "New York", fullTime: true };
    const url = buildLinkedInLink(q);
    expect(url).toContain("keywords=Full+Stack+Developer");
    expect(url).toContain("location=New+York");
  });
});

describe("deep-links — buildDeepLinks", () => {
  it("returns both at once", () => {
    const q: QuerySummary = { role: "QA Engineer", skills: ["Selenium"], where: "Chennai", fullTime: true };
    const links = buildDeepLinks(q);
    expect(links.naukri).toContain("naukri.com/qa-engineer-jobs-in-chennai");
    expect(links.linkedin).toContain("linkedin.com/jobs/search");
    expect(links.linkedin).toContain("keywords=QA+Engineer");
    expect(links.linkedin).toContain("location=Chennai");
  });
});

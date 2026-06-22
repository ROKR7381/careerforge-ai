import { describe, it, expect } from "vitest";
import { resumeToQuery, computeYears } from "../query-builder";
import type { ResumeData } from "@/types/resume";

function makeResume(overrides: Partial<ResumeData> = {}): ResumeData {
  return {
    personal_info: {
      full_name: "Test User",
      email: "test@example.com",
      phone: "",
      professional_title: "Software Engineer",
      location: "Bangalore, India",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    accomplishments: [],
    ...overrides,
  };
}

describe("query-builder — 8 resume edge cases", () => {
  it("case 1: empty resume -> falls back to top-3 skills only", () => {
    const r = makeResume({
      personal_info: { full_name: "", email: "", phone: "", professional_title: "", location: "" },
      experience: [],
      skills: [{ category: "Languages", skills: ["Python", "SQL", "AWS", "Docker"] }],
    });
    const { params, summary } = resumeToQuery(r);
    expect(summary.role).toBe("Any role");
    expect(summary.skills.slice(0, 3)).toEqual(["Python", "SQL", "AWS"]);
    expect(params.q).toContain("python");
    expect(params.q).toContain("sql");
    expect(params.q).toContain("aws");
    // No 4th skill
    expect(params.q).not.toContain("docker");
  });

  it("case 2: fresher (no experience) -> uses title + skills", () => {
    const r = makeResume({
      personal_info: { ...makeResume().personal_info, professional_title: "Junior Developer" },
      experience: [],
      skills: [{ category: "Languages", skills: ["JavaScript", "React"] }],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.role).toBe("Junior Developer");
    expect(summary.skills).toEqual(["JavaScript", "React"]);
  });

  it("case 3: senior (10y+) -> role from latest experience, fullTime true", () => {
    const r = makeResume({
      experience: [
        {
          company: "BigCorp",
          position: "Principal Engineer",
          location: "Bangalore",
          start_date: "2020-01",
          end_date: null,
          description: ["Led team"],
        },
        {
          company: "StartupCo",
          position: "Software Engineer",
          location: "Bangalore",
          start_date: "2014-01",
          end_date: "2019-12",
          description: ["Built features"],
        },
      ],
    });
    const { summary } = resumeToQuery(r);
    // First entry in array is the latest (UI convention)
    expect(summary.role).toBe("Principal Engineer");
    expect(summary.fullTime).toBe(true);
  });

  it("case 4: career-switcher -> uses latest experience title", () => {
    const r = makeResume({
      personal_info: { ...makeResume().personal_info, professional_title: "" }, // no title
      experience: [
        {
          company: "DataCo",
          position: "Data Scientist",
          location: "Mumbai",
          start_date: "2023-01",
          end_date: null,
          description: ["ML models"],
        },
        {
          company: "FinCo",
          position: "Banker",
          location: "Mumbai",
          start_date: "2018-01",
          end_date: "2022-12",
          description: ["Client management"],
        },
      ],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.role).toBe("Data Scientist");
  });

  it("case 5: freelancer -> fullTime false", () => {
    const r = makeResume({
      experience: [
        {
          company: "Self",
          position: "Freelance Designer",
          location: "Goa",
          start_date: "2022-01",
          end_date: null,
          description: ["Contract work for multiple clients"],
        },
      ],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.fullTime).toBe(false);
  });

  it("case 6: no location -> falls back to 'India'", () => {
    const r = makeResume({
      personal_info: { ...makeResume().personal_info, location: "" },
    });
    const { summary, params } = resumeToQuery(r);
    expect(summary.where).toBe("India");
    expect(params.where).toBe("India");
  });

  it("case 6b: location 'in' or 'india' -> 'India'", () => {
    const r1 = makeResume({
      personal_info: { ...makeResume().personal_info, location: "in" },
    });
    expect(resumeToQuery(r1).summary.where).toBe("India");

    const r2 = makeResume({
      personal_info: { ...makeResume().personal_info, location: "India" },
    });
    expect(resumeToQuery(r2).summary.where).toBe("India");
  });

  it("case 7: no skills -> title only", () => {
    const r = makeResume({
      personal_info: { ...makeResume().personal_info, professional_title: "Accountant" },
      skills: [],
    });
    const { params, summary } = resumeToQuery(r);
    expect(summary.skills).toEqual([]);
    expect(params.q).toContain("accountant");
  });

  it("case 8: multi-experience -> uses FIRST entry (latest by UI convention)", () => {
    const r = makeResume({
      experience: [
        {
          company: "CurrentCo",
          position: "Tech Lead",
          location: "Bangalore",
          start_date: "2024-01",
          end_date: null,
          description: ["Leading team"],
        },
        {
          company: "PrevCo",
          position: "Senior Engineer",
          location: "Bangalore",
          start_date: "2020-01",
          end_date: "2023-12",
          description: ["Building things"],
        },
        {
          company: "FirstCo",
          position: "Junior Engineer",
          location: "Pune",
          start_date: "2017-01",
          end_date: "2019-12",
          description: ["Learning"],
        },
      ],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.role).toBe("Tech Lead");
  });

  it("primary/core skill groups are preferred", () => {
    const r = makeResume({
      skills: [
        { category: "Soft Skills", skills: ["Communication", "Leadership"] },
        { category: "Primary", skills: ["Python", "PyTorch"] },
        { category: "Other", skills: ["Excel", "PowerPoint"] },
      ],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.skills.slice(0, 3)).toEqual(["Python", "PyTorch"]);
  });

  it("dedupes skills across groups case-insensitively", () => {
    const r = makeResume({
      skills: [
        { category: "A", skills: ["Python", "SQL"] },
        { category: "B", skills: ["python", "AWS"] },
      ],
    });
    const { summary } = resumeToQuery(r);
    expect(summary.skills).toEqual(["Python", "SQL", "AWS"]);
  });

  it("handles null resume gracefully", () => {
    const { params, summary } = resumeToQuery(null);
    expect(params.q).toBe("jobs");
    expect(summary.role).toBe("Any role");
    expect(summary.where).toBe("India");
  });
});

describe("query-builder — computeYears", () => {
  it("returns 0 for empty experience", () => {
    expect(computeYears(makeResume())).toBe(0);
  });

  it("computes span between earliest start and latest end", () => {
    const r = makeResume({
      experience: [
        { company: "A", position: "x", location: "", start_date: "2020-01", end_date: "2023-12", description: [] },
        { company: "B", position: "y", location: "", start_date: "2018-01", end_date: "2019-12", description: [] },
      ],
    });
    expect(computeYears(r)).toBe(5);
  });

  it("treats null end_date as ongoing", () => {
    const r = makeResume({
      experience: [
        { company: "A", position: "x", location: "", start_date: "2020-01", end_date: null, description: [] },
      ],
    });
    // min=2020, max=current year (>=2026)
    const years = computeYears(r);
    expect(years).toBeGreaterThanOrEqual(6);
  });

  it("returns null when no parseable dates", () => {
    const r = makeResume({
      experience: [
        { company: "A", position: "x", location: "", start_date: "", end_date: "", description: [] },
      ],
    });
    expect(computeYears(r)).toBeNull();
  });
});

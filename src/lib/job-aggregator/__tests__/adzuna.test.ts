import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { search, AdzunaError } from "../adzuna";
import type { JobSearchParams } from "../types";

const sampleParams: JobSearchParams = {
  q: "Data Scientist",
  where: "Bangalore",
  resultsPerPage: 25,
  maxDaysOld: 30,
  fullTime: true,
};

const sampleAdzunaResponse = {
  count: 2,
  results: [
    {
      id: "12345",
      title: "Senior Data Scientist",
      company: { display_name: "Razorpay" },
      location: { display_name: "Bangalore, India" },
      description: "Build ML models using Python and AWS.",
      redirect_url: "https://www.naukri.com/job/12345",
      created: "2026-06-15T00:00:00Z",
      salary_min: 1500000,
      salary_max: 2500000,
      source: { name: "Naukri", id: "naukri" },
    },
    {
      id: "67890",
      title: "ML Engineer",
      company: { display_name: "PhonePe" },
      location: { display_name: "Bangalore" },
      description: "PyTorch and TensorFlow work.",
      redirect_url: "https://www.linkedin.com/jobs/view/67890",
      created: "2026-06-20T00:00:00Z",
      salary_min: null,
      salary_max: null,
      source: "LinkedIn",
    },
  ],
};

describe("adzuna — search", () => {
  const originalFetch = global.fetch;
  const originalAppId = process.env.ADZUNA_APP_ID;
  const originalAppKey = process.env.ADZUNA_APP_KEY;

  beforeEach(() => {
    process.env.ADZUNA_APP_ID = "test_app_id";
    process.env.ADZUNA_APP_KEY = "test_app_key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalAppId === undefined) delete process.env.ADZUNA_APP_ID;
    else process.env.ADZUNA_APP_ID = originalAppId;
    if (originalAppKey === undefined) delete process.env.ADZUNA_APP_KEY;
    else process.env.ADZUNA_APP_KEY = originalAppKey;
  });

  function mockFetch(status: number, body: any): void {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ) as any;
  }

  it("happy path: normalises jobs correctly", async () => {
    mockFetch(200, sampleAdzunaResponse);
    const jobs = await search(sampleParams);
    expect(jobs).toHaveLength(2);

    expect(jobs[0]).toMatchObject({
      externalId: "12345",
      title: "Senior Data Scientist",
      company: "Razorpay",
      location: "Bangalore, India",
      description: expect.any(String),
      url: "https://www.naukri.com/job/12345",
      source: "naukri",
      postedAt: "2026-06-15T00:00:00.000Z",
    });
    expect(jobs[0].salary).toBe("15L\u201325L");

    expect(jobs[1].source).toBe("linkedin");
    expect(jobs[1].salary).toBeUndefined();
  });

  it("falls back to 'adzuna' source when source field is missing", async () => {
    mockFetch(200, {
      results: [
        {
          id: "1",
          title: "x",
          company: { display_name: "y" },
          location: { display_name: "Bangalore" },
          description: "d",
          redirect_url: "https://example.com",
          created: "2026-06-01T00:00:00Z",
        },
      ],
    });
    const jobs = await search(sampleParams);
    expect(jobs[0].source).toBe("adzuna");
  });

  it("skips malformed entries (missing title or description)", async () => {
    mockFetch(200, {
      results: [
        { id: "1", title: "", description: "d", redirect_url: "u", company: { display_name: "c" }, location: { display_name: "l" } },
        { id: "2", title: "ok", description: "", redirect_url: "u", company: { display_name: "c" }, location: { display_name: "l" } },
        { id: "3", title: "ok", description: "d", redirect_url: "", company: { display_name: "c" }, location: { display_name: "l" } },
      ],
    });
    const jobs = await search(sampleParams);
    expect(jobs).toHaveLength(0);
  });

  it("throws AdzunaError(401) on bad credentials", async () => {
    mockFetch(401, { error: "unauthorized" });
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: 401,
    });
  });

  it("throws AdzunaError(429) on rate limit", async () => {
    mockFetch(429, { error: "rate limited" });
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: 429,
    });
  });

  it("throws AdzunaError(500) on upstream error", async () => {
    mockFetch(503, { error: "down" });
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: 503,
    });
  });

  it("throws AdzunaError(null) on network failure", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("ECONNRESET");
    }) as any;
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: null,
    });
  });

  it("throws AdzunaError(null) when env keys missing", async () => {
    delete process.env.ADZUNA_APP_ID;
    delete process.env.ADZUNA_APP_KEY;
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: null,
    });
  });

  it("throws on malformed JSON response", async () => {
    global.fetch = vi.fn(async () =>
      new Response("not json", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ) as any;
    await expect(search(sampleParams)).rejects.toMatchObject({
      name: "AdzunaError",
      status: 200,
    });
  });

  it("resolves country code based on city name", async () => {
    mockFetch(200, { results: [] });
    await search({ ...sampleParams, where: "Bangalore" });
    const lastCall = (global.fetch as any).mock.calls[0][0] as string;
    expect(lastCall).toContain("/jobs/in/search/");

    await search({ ...sampleParams, where: "London" });
    const url2 = (global.fetch as any).mock.calls[1][0] as string;
    expect(url2).toContain("/jobs/gb/search/");

    await search({ ...sampleParams, where: "New York" });
    const url3 = (global.fetch as any).mock.calls[2][0] as string;
    expect(url3).toContain("/jobs/us/search/");

    await search({ ...sampleParams, where: "Unknown Place" });
    const url4 = (global.fetch as any).mock.calls[3][0] as string;
    expect(url4).toContain("/jobs/in/search/"); // default for Naukri/LinkedIn focus
  });
});

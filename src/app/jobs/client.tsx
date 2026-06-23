"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, RefreshCw, Sparkles, Lock, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { JobFeed, FeedSkeleton } from "@/components/jobs/job-feed";
import { QueryEditor } from "@/components/jobs/query-editor";
import { EmptyState } from "@/components/jobs/empty-state";
import { ErrorState } from "@/components/jobs/error-state";

import { buildDeepLinks } from "@/lib/job-aggregator/deep-links";
import type {
  RecommendationsResponse,
  ScoredJob,
  QuerySummary,
  SavedJobDTO,
} from "@/lib/job-aggregator/types";

interface JobsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string | null;
  };
}

type Status = "idle" | "loading" | "ready" | "empty" | "no_resume" | "error";

function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "less than an hour ago";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export function JobsClient({ user }: JobsClientProps) {
  const isPro = user.subscriptionPlan !== "FREE";
  const [status, setStatus] = useState<Status>("idle");
  const [jobs, setJobs] = useState<ScoredJob[]>([]);
  const [query, setQuery] = useState<QuerySummary | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Deep-links for the current query (same URL for every job in this batch).
  const deepLinksFor = useCallback(
    (_job: ScoredJob) => (query ? buildDeepLinks(query) : { naukri: "", linkedin: "" }),
    [query],
  );

  /** Fetch saved jobs so the Save toggle shows correct state on mount. */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/jobs/saved", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { jobs: SavedJobDTO[] };
        if (!cancelled) {
          const ids = new Set<string>();
          for (const j of data.jobs) if (j.externalId) ids.add(j.externalId);
          setSavedIds(ids);
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchRecommendations = useCallback(
    async (overrides?: { q?: string; where?: string; fullTime?: boolean }) => {
      setStatus("loading");
      setErrorMsg("");
      try {
        const res = await fetch("/api/jobs/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(overrides ?? {}),
          cache: "no-store",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (res.status === 404) {
          setStatus("no_resume");
          return;
        }
        if (!res.ok) {
          const err = (await res.json().catch(() => ({}))) as { message?: string };
          setErrorMsg(err.message || `Request failed (${res.status})`);
          setStatus("error");
          return;
        }

        const data = (await res.json()) as RecommendationsResponse;
        setQuery(data.query);
        setCachedAt(data.cachedAt);
        if (data.jobs.length === 0) {
          setJobs([]);
          setStatus("empty");
        } else {
          setJobs(data.jobs);
          setStatus("ready");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Network error");
        setStatus("error");
      }
    },
    [],
  );

  // Auto-load on mount
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/jobs/refresh", { method: "POST" });
      await fetchRecommendations();
      toast.success("Recommendations refreshed");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleApplyOverrides(overrides: { q?: string; where?: string; fullTime?: boolean }) {
    await fetchRecommendations(overrides);
  }

  async function handleToggleSave(job: ScoredJob) {
    // Plan gate: Smart Job Search "save" is a Pro feature. Free users can
    // browse and apply externally via the deep links, but cannot keep a
    // private shortlist of saved jobs.
    if (!isPro) {
      toast.error("Saving jobs is a Pro feature.", {
        description:
          "Subscribe to keep a private shortlist of jobs matched to your resume.",
        action: {
          label: "Unlock from ₹249",
          onClick: () => {
            window.location.href = "/billing?plan=TRIAL";
          },
        },
        duration: 8000,
      });
      return;
    }

    setSavingId(job.externalId);
    const wasSaved = savedIds.has(job.externalId);
    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(job.externalId);
      else next.add(job.externalId);
      return next;
    });

    try {
      if (wasSaved) {
        const res = await fetch(`/api/jobs/save?externalId=${encodeURIComponent(job.externalId)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Unsave failed");
        toast.success("Removed from saved");
      } else {
        const res = await fetch("/api/jobs/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            externalId: job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            source: job.source,
            description: job.description,
            matchScore: job.matchScore,
            matchedKeywords: job.matchedKeywords,
            missingKeywords: job.missingKeywords,
            postedAt: job.postedAt,
            salary: job.salary,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
        toast.success("Saved");
      }
    } catch (err: any) {
      // Revert optimistic update
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(job.externalId);
        else next.delete(job.externalId);
        return next;
      });
      toast.error(err?.message || "Action failed");
    } finally {
      setSavingId(null);
    }
  }

  const headerSubtitle = useMemo(() => {
    if (status === "ready" || status === "empty") {
      return `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"} matching your latest resume`;
    }
    if (status === "loading") return "Finding your best matches\u2026";
    if (status === "no_resume") return "Build a resume to unlock personalised jobs";
    return "Personalised jobs from Naukri, LinkedIn, Indeed and more";
  }, [status, jobs.length]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Briefcase className="h-7 w-7 text-primary" />
          Smart Job Discovery
          {!isPro && (
            <Badge variant="outline" className="ml-1 text-[10px]">
              <Lock className="h-2.5 w-2.5 mr-1" />
              Save is Pro
            </Badge>
          )}
        </h1>
        <p className="mt-1 text-muted-foreground">{headerSubtitle}</p>
      </motion.div>

      {/* Free-tier upsell: browse freely, save with Pro */}
      {!isPro && (status === "ready" || status === "empty") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="p-4 border-primary/20 bg-gradient-to-r from-indigo-50/60 to-purple-50/60">
            <div className="flex items-start gap-3 flex-wrap">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookmarkPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-slate-900">
                  Save your favourites with Pro
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Free users can browse and apply directly. Pro users get a
                  private shortlist, AI match scores, and unlimited saves.
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link href="/billing?plan=TRIAL">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Try 7 days — ₹249
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/billing?plan=ANNUAL">Yearly ₹1,499</Link>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stale-cache banner */}
      {cachedAt && (status === "ready" || status === "empty") && (
        <Card className="p-3 mb-4 flex items-center justify-between bg-amber-50/50 border-amber-200">
          <p className="text-xs text-amber-800">
            Showing results from <strong>{formatTimeAgo(cachedAt)}</strong>.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-amber-800 hover:text-amber-900"
          >
            <RefreshCw className={refreshing ? "mr-1.5 h-3.5 w-3.5 animate-spin" : "mr-1.5 h-3.5 w-3.5"} />
            Refresh
          </Button>
        </Card>
      )}

      {/* Query editor (only when ready/empty/loading-with-query) */}
      {query && status !== "no_resume" && status !== "error" && (
        <Card className="p-4 mb-4">
          <QueryEditor
            query={query}
            onApply={handleApplyOverrides}
            loading={status === "loading"}
          />
        </Card>
      )}

      {/* Main content area */}
      {status === "idle" || status === "loading" ? (
        <FeedSkeleton />
      ) : status === "no_resume" ? (
        <EmptyState />
      ) : status === "error" ? (
        <ErrorState
          title="We couldn't load jobs right now"
          message={errorMsg || "Something went wrong reaching the job source."}
          onRetry={() => fetchRecommendations()}
        />
      ) : status === "empty" ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No jobs matched. Try editing your search above to broaden the query.
          </p>
        </Card>
      ) : (
        <JobFeed
          jobs={jobs}
          deepLinksFor={deepLinksFor}
          savedIds={savedIds}
          savingId={savingId}
          onToggleSave={handleToggleSave}
        />
      )}

      {/* Always-visible refresh button at the bottom for ready state */}
      {status === "ready" && !cachedAt && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="btn-3d">
            <RefreshCw className={refreshing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Refresh from source
          </Button>
        </div>
      )}
    </div>
  );
}

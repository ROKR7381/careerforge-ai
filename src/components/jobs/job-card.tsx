"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeepLinks, JobSource, ScoredJob } from "@/lib/job-aggregator/types";

interface JobCardProps {
  job: ScoredJob;
  deepLinks: DeepLinks;
  /** True if this job is already in the user's saved set. */
  saved: boolean;
  /** Pending state for the save/unsave toggle. */
  saving?: boolean;
  /** Called when the user toggles save. */
  onToggleSave: (job: ScoredJob) => void;
}

const SOURCE_LABEL: Record<JobSource, string> = {
  naukri: "Naukri",
  linkedin: "LinkedIn",
  indeed: "Indeed",
  foundit: "Foundit",
  hirist: "Hirist",
  glassdoor: "Glassdoor",
  monster: "Monster",
  adzuna: "Adzuna",
  other: "Aggregator",
};

const SOURCE_VARIANT: Record<JobSource, "default" | "secondary" | "outline"> = {
  naukri: "default",
  linkedin: "default",
  indeed: "secondary",
  foundit: "outline",
  hirist: "outline",
  glassdoor: "outline",
  monster: "outline",
  adzuna: "outline",
  other: "outline",
};

function scoreColor(score: number): string {
  if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200";
  if (score >= 40) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.round((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job, deepLinks, saved, saving = false, onToggleSave }: JobCardProps) {
  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      {/* Top row: match score + source badge + posted */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          {!job.scoreUnavailable ? (
            <Badge variant="outline" className={cn("font-bold", scoreColor(job.matchScore))}>
              ★ {job.matchScore}% match
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-slate-50 text-slate-500">
              Score unavailable
            </Badge>
          )}
          <Badge variant={SOURCE_VARIANT[job.source]}>{SOURCE_LABEL[job.source]}</Badge>
          {job.remote && (
            <Badge variant="secondary" className="text-xs">Remote OK</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{relativeTime(job.postedAt)}</span>
      </div>

      {/* Title + company + location */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold leading-tight">{job.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {job.company} · {job.location}
          {job.salary && <> · {job.salary}</>}
        </p>
      </div>

      {/* Keywords */}
      {(job.matchedKeywords.length > 0 || job.missingKeywords.length > 0) && (
        <div className="mb-4 space-y-2">
          {job.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-emerald-700 font-medium mr-1">Matched:</span>
              {job.matchedKeywords.slice(0, 6).map((kw, i) => (
                <Badge key={i} variant="success" className="text-xs">{kw}</Badge>
              ))}
            </div>
          )}
          {job.missingKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-amber-700 font-medium mr-1">Missing:</span>
              {job.missingKeywords.slice(0, 4).map((kw, i) => (
                <Badge key={i} variant="warning" className="text-xs">{kw}</Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
        <Button asChild variant="default" size="sm" className="btn-3d">
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            Apply <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="btn-3d">
          <a href={deepLinks.naukri} target="_blank" rel="noopener noreferrer">
            Search Naukri <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
        <Button asChild variant="outline" size="sm" className="btn-3d">
          <a href={deepLinks.linkedin} target="_blank" rel="noopener noreferrer">
            Search LinkedIn <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          className="btn-3d ml-auto"
          onClick={() => onToggleSave(job)}
          disabled={saving}
          aria-label={saved ? "Unsave job" : "Save job"}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}

"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { JobCard } from "./job-card";
import type { DeepLinks, ScoredJob } from "@/lib/job-aggregator/types";

interface JobFeedProps {
  jobs: ScoredJob[];
  deepLinksFor: (job: ScoredJob) => DeepLinks;
  savedIds: Set<string>;
  savingId: string | null;
  onToggleSave: (job: ScoredJob) => void;
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
          <div className="h-6 w-3/4 rounded bg-muted mb-2" />
          <div className="h-4 w-1/2 rounded bg-muted mb-4" />
          <div className="flex gap-1 mb-4">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded bg-muted" />
            <div className="h-9 w-32 rounded bg-muted" />
            <div className="h-9 w-32 rounded bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function JobFeed({ jobs, deepLinksFor, savedIds, savingId, onToggleSave }: JobFeedProps) {
  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No jobs matched. Try editing your search to broaden the query.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.externalId}
          job={job}
          deepLinks={deepLinksFor(job)}
          saved={savedIds.has(job.externalId)}
          saving={savingId === job.externalId}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

export { FeedSkeleton };

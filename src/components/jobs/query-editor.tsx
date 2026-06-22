"use client";

import * as React from "react";
import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuerySummary } from "@/lib/job-aggregator/types";

interface QueryEditorProps {
  query: QuerySummary;
  onApply: (overrides: { q?: string; where?: string; fullTime?: boolean }) => void;
  loading: boolean;
  /** Whether the user can edit role/where (skills are always read-only summary). */
  editable?: boolean;
}

export function QueryEditor({ query, onApply, loading, editable = true }: QueryEditorProps) {
  const [role, setRole] = useState(query.role);
  const [where, setWhere] = useState(query.where);

  // Reset local state if query changes from outside (refresh).
  React.useEffect(() => {
    setRole(query.role);
    setWhere(query.where);
  }, [query.role, query.where]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply({ q: role, where });
  }

  function handleClear() {
    setRole(query.role);
    setWhere(query.where);
  }

  const dirty = role !== query.role || where !== query.where;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Search className="h-3.5 w-3.5" />
        <span>Searching for</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {editable ? (
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role (e.g. Data Scientist)"
            className="h-8 max-w-[200px] text-sm"
            aria-label="Role"
          />
        ) : (
          <Badge variant="secondary" className="h-8 px-3">
            {query.role}
          </Badge>
        )}

        <span className="text-muted-foreground text-sm">in</span>

        {editable ? (
          <Input
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="City (e.g. Bangalore)"
            className="h-8 max-w-[180px] text-sm"
            aria-label="Location"
          />
        ) : (
          <Badge variant="secondary" className="h-8 px-3">
            {query.where}
          </Badge>
        )}

        {query.skills.length > 0 && (
          <>
            <span className="text-muted-foreground text-sm">using</span>
            {query.skills.map((s) => (
              <Badge key={s} variant="outline" className="h-8 px-3 text-xs">
                {s}
              </Badge>
            ))}
          </>
        )}

        {query.fullTime && (
          <Badge variant="outline" className="h-8 px-3 text-xs">
            Full-time
          </Badge>
        )}
      </div>

      {editable && (
        <div className="flex items-center gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={loading || !dirty}
            className={cn("btn-3d", !dirty && "opacity-50")}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5 mr-1.5" />
            )}
            Re-search
          </Button>
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={loading}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

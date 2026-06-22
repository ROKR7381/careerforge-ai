"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** Optional retry callback (button is hidden when omitted). */
  onRetry?: () => void;
  retrying?: boolean;
}

export function ErrorState({
  title = "We couldn't load jobs right now",
  message = "Something went wrong reaching the job source. This is usually temporary.",
  onRetry,
  retrying,
}: ErrorStateProps) {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 mb-4">
        <AlertTriangle className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} disabled={retrying} className="btn-3d">
          <RefreshCw className={cn("mr-2 h-4 w-4", retrying && "animate-spin")} />
          Try again
        </Button>
      )}
    </Card>
  );
}

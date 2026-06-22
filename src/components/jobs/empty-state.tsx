"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Briefcase className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No personalised jobs yet</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Upload your resume in the builder, and we&apos;ll automatically find jobs that match your
        skills, experience, and preferred location — sourced from Naukri, LinkedIn, Indeed, and
        more.
      </p>
      <Button asChild size="lg" className="btn-3d">
        <Link href="/builder">
          <FileText className="mr-2 h-4 w-4" />
          Build your resume
        </Link>
      </Button>
    </Card>
  );
}

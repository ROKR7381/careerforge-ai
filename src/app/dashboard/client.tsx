"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Bot,
  Briefcase,
  ArrowRight,
  Plus,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Trash2,
  Loader2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";


interface DashboardClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string | null;
  };
  resumes: Array<{
    id: string;
    title: string;
    templateName: string;
    updatedAt: Date;
  }>;
  interviews: Array<{
    id: string;
    jobTitle: string;
    completed: boolean;
    overallScore: number | null;
    createdAt: Date;
  }>;
  savedJobs: Array<{
    id: string;
    jobTitle: string;
    company: string;
    matchScore: number | null;
    createdAt: Date;
  }>;
}

export function DashboardClient({
  user,
  resumes,
  interviews,
  savedJobs,
}: DashboardClientProps) {
  const router = useRouter();
  const [localResumes, setLocalResumes] = useState(resumes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalResumes(resumes);
  }, [resumes]);

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLocalResumes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Resume deleted successfully");
        router.refresh();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || "Failed to delete resume");
      }
    } catch (err) {
      toast.error("Failed to delete resume");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const stats = [
    { label: "Resumes", value: localResumes.length, icon: FileText, href: "/builder" },
    { label: "Interviews", value: interviews.length, icon: Bot, href: "/interview" },
    { label: "Saved Jobs", value: savedJobs.length, icon: Briefcase, href: "/jobs" },
  ];


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s your career progress overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.subscriptionPlan === "FREE" && (
              <Button asChild>
                <Link href="/billing">
                  <Sparkles className="mr-2 h-4 w-4" /> Upgrade to Premium
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/builder">
                <Plus className="mr-2 h-4 w-4" /> New Resume
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Resumes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Resumes
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/builder">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {localResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No resumes yet</p>
                  <Button size="sm" asChild>
                    <Link href="/builder">Create Your First Resume</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {localResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50 group border border-transparent hover:border-border"
                    >
                      <Link
                        href={`/builder?id=${resume.id}`}
                        className="flex-1 min-w-0"
                      >
                        <p className="text-sm font-medium truncate">{resume.title}</p>
                        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                          {resume.templateName} &middot;{" "}
                          {formatDistanceToNow(new Date(resume.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs capitalize">
                          {resume.templateName}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/share/${resume.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success("Share link copied to clipboard!");
                          }}
                          title="Copy Share Link"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={deletingId === resume.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteResume(resume.id);
                          }}
                        >
                          {deletingId === resume.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Interview Practice
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/interview">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bot className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No interview practice yet
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/interview">Start Practicing</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {interviews.map((interview) => (
                    <Link
                      key={interview.id}
                      href={`/interview?id=${interview.id}`}
                      className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="text-sm font-medium">{interview.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {interview.completed
                            ? `Score: ${interview.overallScore}/100`
                            : "In progress"}
                        </p>
                      </div>
                      {interview.overallScore && (
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`h-4 w-4 ${
                              interview.overallScore >= 70
                                ? "text-green-500"
                                : interview.overallScore >= 50
                                ? "text-amber-500"
                                : "text-red-500"
                            }`}
                          />
                          <span className="text-sm font-semibold">
                            {interview.overallScore}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

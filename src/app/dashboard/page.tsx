import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [resumes, interviews, savedJobs] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.interviewSession.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.savedJob.findMany({
      where: { userId: session.id, saved: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <DashboardClient
      user={session}
      resumes={resumes}
      interviews={interviews}
      savedJobs={savedJobs}
    />
  );
}

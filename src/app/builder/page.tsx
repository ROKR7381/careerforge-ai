import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ResumeBuilderClient } from "./client";

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; template?: string; format?: string; sample?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (!session) {
    const query = new URLSearchParams(params as any).toString();
    const dest = `/builder${query ? `?${query}` : ""}`;
    redirect(`/login?redirect=${encodeURIComponent(dest)}`);
  }
  let initialResume = null;
  let resumeId: string | null = null;

  if (params.id) {
    const existing = await prisma.resume.findFirst({
      where: { id: params.id, userId: session.id },
    });
    if (existing) {
      initialResume = existing.resumeJson as any;
      resumeId = existing.id;
    }
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, templateName: true, updatedAt: true },
  });

  return (
    <ResumeBuilderClient
      user={session}
      initialResume={initialResume}
      resumeId={resumeId}
      resumes={resumes}
    />
  );
}

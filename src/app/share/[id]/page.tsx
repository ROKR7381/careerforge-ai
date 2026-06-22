import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShareClient } from "./client";

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const resume = await prisma.resume.findUnique({
    where: { id },
  });

  if (!resume) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://careerforge-ai-nine.vercel.app"}/share/${id}`;

  return (
    <ShareClient
      resume={resume.resumeJson as any}
      title={resume.title}
      templateName={resume.templateName as any}
      shareUrl={shareUrl}
    />
  );
}

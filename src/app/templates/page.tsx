import { getSession } from "@/lib/auth";
import { TemplatesClient } from "./client";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const session = await getSession();
  const resolvedParams = await searchParams;
  return <TemplatesClient user={session} initialCategory={resolvedParams.category} />;
}


import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { JobsClient } from "./client";

export default async function JobsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <JobsClient user={session} />;
}

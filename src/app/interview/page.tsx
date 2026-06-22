import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { InterviewClient } from "./client";

export default async function InterviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <InterviewClient user={session} />;
}

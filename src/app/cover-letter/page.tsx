import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CoverLetterClient } from "./client";

export default async function CoverLetterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <CoverLetterClient user={session} />;
}

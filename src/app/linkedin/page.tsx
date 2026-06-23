import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LinkedInClient } from "./client";

export const metadata = {
  title: "LinkedIn Optimizer — CareerForge AI",
  description:
    "Import your LinkedIn profile and instantly optimize your resume with AI. Get ATS-ready in minutes.",
};

export default async function LinkedInPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/linkedin");

  return (
    <LinkedInClient
      user={{
        id: session.id,
        email: session.email,
        name: session.name,
        subscriptionPlan: session.subscriptionPlan ?? "FREE",
      }}
    />
  );
}

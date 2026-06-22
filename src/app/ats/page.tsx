import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AtsClient } from "./client";

export default async function AtsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <AtsClient user={session} />;
}

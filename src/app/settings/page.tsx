import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <SettingsClient user={session} />;
}

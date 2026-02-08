import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { syncUserToDb } from "@/lib/auth/sync-user";
import { getTeamsForUser } from "@/lib/team";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const { data: session } = await getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  await syncUserToDb();

  const teams = await getTeamsForUser(session.user.id);

  return (
    <DashboardContent
      teams={teams}
      userName={session.user.name ?? null}
      currentUserId={session.user.id}
    />
  );
}

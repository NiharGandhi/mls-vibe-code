import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageTeams } from "@/lib/admin";
import { getAllTeamsForAdmin } from "@/lib/admin-teams";
import { redirect } from "next/navigation";
import { AdminTeamsList } from "./AdminTeamsList";

export default async function AdminTeamsPage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageTeams(role)) redirect("/admin");

  const teams = await getAllTeamsForAdmin();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Teams
        </h1>
        <p className="mt-1 text-muted-foreground">
          View and manage all teams. Update status to open, closed, or disqualified.
        </p>
      </header>

      <AdminTeamsList teams={teams} />
    </div>
  );
}

import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { getAllChallenges } from "@/lib/challenge";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminChallengesList } from "./AdminChallengesList";

export default async function AdminChallengesPage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) redirect("/admin");

  const challenges = await getAllChallenges();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Challenges
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage challenges
          </p>
        </header>
        <Button asChild>
          <Link href="/admin/challenges/new" className="flex items-center gap-2">
            <Plus className="size-4" />
            New challenge
          </Link>
        </Button>
      </div>

      <AdminChallengesList challenges={challenges} />
    </div>
  );
}

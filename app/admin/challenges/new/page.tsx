import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { redirect } from "next/navigation";
import { CreateChallengeForm } from "./CreateChallengeForm";

export default async function NewChallengePage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) redirect("/admin");

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New challenge
        </h1>
        <p className="mt-1 text-muted-foreground">
          Create a new challenge for teams to compete in
        </p>
      </header>

      <CreateChallengeForm />
    </div>
  );
}

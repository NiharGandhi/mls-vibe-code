import { getSession } from "@/lib/auth/server";
import { getAdminRole, canSendNotifications } from "@/lib/admin";
import { getAllChallenges } from "@/lib/challenge";
import { redirect } from "next/navigation";
import { SendNotificationForm } from "./SendNotificationForm";

export default async function AdminNotificationsPage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canSendNotifications(role)) redirect("/admin");

  const challenges = await getAllChallenges();

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Send notifications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Send alerts to all users or regarding a specific challenge
        </p>
      </header>

      <SendNotificationForm challenges={challenges} />
    </div>
  );
}

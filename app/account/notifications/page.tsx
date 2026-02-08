import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import Link from "next/link";
import { NotificationsPageContent } from "./NotificationsPageContent"

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const { data: session } = await getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="container mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Notifications
        </h1>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Dashboard
        </Link>
      </div>
      <NotificationsPageContent />
    </main>
  );
}

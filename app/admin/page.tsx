import { getSession } from "@/lib/auth/server";
import { getAdminRole } from "@/lib/admin";
import { db } from "@/db";
import { challenges, teams, users, submissions } from "@/db/schema";
import { count } from "drizzle-orm";
import Link from "next/link";
import { Trophy, Users, FileCheck, UserCog } from "lucide-react";

export default async function AdminDashboardPage() {
  const { data: session } = await getSession();
  const role = session?.user?.id ? await getAdminRole(session.user.id) : null;

  const [challengeCount] = await db.select({ count: count() }).from(challenges);
  const [teamCount] = await db.select({ count: count() }).from(teams);
  const [userCount] = await db.select({ count: count() }).from(users);
  const [submissionCount] = await db.select({ count: count() }).from(submissions);

  const stats = [
    { label: "Challenges", value: challengeCount?.count ?? 0, href: "/admin/challenges", icon: Trophy },
    { label: "Teams", value: teamCount?.count ?? 0, href: "/admin/teams", icon: Users },
    { label: "Submissions", value: submissionCount?.count ?? 0, href: "/admin/submissions", icon: FileCheck },
    { label: "Users", value: userCount?.count ?? 0, href: "/admin/users", icon: UserCog },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Admin dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage challenges, teams, submissions, and users. Role:{" "}
          <span className="font-medium capitalize text-foreground">
            {role?.replace("_", " ") ?? "—"}
          </span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-muted/50"
          >
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

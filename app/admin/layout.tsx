import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";
import {
  LayoutDashboard,
  Trophy,
  Users,
  UserCog,
  FileCheck,
  Bell,
  ArrowLeft,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const admin = await isAdmin(session.user.id);
  if (!admin) {
    redirect("/dashboard");
  }

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/challenges", label: "Challenges", icon: Trophy },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/submissions", label: "Submissions", icon: FileCheck },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/users", label: "Users", icon: UserCog },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-semibold tracking-tight text-foreground"
            >
              Admin
            </Link>
            <nav className="hidden gap-1 md:flex">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

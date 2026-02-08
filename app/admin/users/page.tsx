import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageUsers } from "@/lib/admin";
import { db, users, adminUsers } from "@/db";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminUsersList } from "./AdminUsersList";

export default async function AdminUsersPage() {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageUsers(role)) redirect("/admin");

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const adminList = await db
    .select({ userId: adminUsers.userId, role: adminUsers.role })
    .from(adminUsers);

  const adminMap = new Map(adminList.map((a) => [a.userId, a.role]));

  const usersWithAdmin = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    adminRole: adminMap.get(u.id) ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Users
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage users and promote to admin (super_admin only)
        </p>
      </header>

      <AdminUsersList users={usersWithAdmin} />
    </div>
  );
}

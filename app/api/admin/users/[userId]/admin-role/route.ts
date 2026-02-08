import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageAdminUsers } from "@/lib/admin";
import { db, adminUsers } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageAdminUsers(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  let body: { role?: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newRole = body.role;
  const validRoles = ["super_admin", "organizer", "judge", "mentor"];

  if (newRole === null || newRole === undefined || newRole === "") {
    await db.delete(adminUsers).where(eq(adminUsers.userId, userId));
    return Response.json({ ok: true });
  }

  if (typeof newRole !== "string" || !validRoles.includes(newRole)) {
    return Response.json({ error: "Invalid admin role" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.userId, userId));

  if (existing.length > 0) {
    await db
      .update(adminUsers)
      .set({ role: newRole as "super_admin" | "organizer" | "judge" | "mentor" })
      .where(eq(adminUsers.userId, userId));
  } else {
    await db.insert(adminUsers).values({
      userId,
      role: newRole as "super_admin" | "organizer" | "judge" | "mentor",
    });
  }

  return Response.json({ ok: true });
}

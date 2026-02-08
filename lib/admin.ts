import { db, adminUsers, challengeRoles } from "@/db";
import { eq, and } from "drizzle-orm";

export type AdminRole = "super_admin" | "organizer" | "judge" | "mentor";

export async function getAdminRole(userId: string): Promise<AdminRole | null> {
  const [row] = await db
    .select({ role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.userId, userId));
  return row?.role ?? null;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getAdminRole(userId);
  return role != null;
}

export function canManageChallenges(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "organizer";
}

export function canManageTeams(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "organizer";
}

export function canManageUsers(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin";
}

export function canJudgeSubmissions(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "organizer" || role === "judge";
}

export function canManageAdminUsers(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin";
}

export function canSendNotifications(role: AdminRole | null): boolean {
  if (!role) return false;
  return role === "super_admin" || role === "organizer";
}

/** True if user is a judge for this challenge (global judge role or challenge_roles judge). */
export async function isJudgeForChallenge(
  userId: string,
  challengeId: number
): Promise<boolean> {
  const role = await getAdminRole(userId);
  if (role === "super_admin" || role === "organizer") return true;
  const [row] = await db
    .select({ id: challengeRoles.id })
    .from(challengeRoles)
    .where(
      and(
        eq(challengeRoles.challengeId, challengeId),
        eq(challengeRoles.userId, userId),
        eq(challengeRoles.role, "judge")
      )
    );
  return !!row;
}

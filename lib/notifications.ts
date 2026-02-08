import { db, notifications, users, teams, teamMembers } from "@/db";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";

export type NotificationType =
  | "invite_received"
  | "invite_accepted"
  | "join_request_received"
  | "join_request_approved"
  | "submission_feedback"
  | "system_announcement";

export type Notification = {
  id: number;
  userId: string;
  type: NotificationType;
  priority: string;
  urgency: string;
  title: string;
  body: string | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

/** Create a notification for a user. */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  priority?: "low" | "normal" | "high";
  urgency?: "info" | "warning" | "critical";
}): Promise<{ id: number }> {
  const [row] = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body ?? null,
      relatedEntityType: params.relatedEntityType ?? null,
      relatedEntityId: params.relatedEntityId ?? null,
      priority: params.priority ?? "normal",
      urgency: params.urgency ?? "info",
    })
    .returning({ id: notifications.id });
  return { id: row!.id };
}

/** Get notifications for a user, newest first. */
export async function getNotificationsForUser(
  userId: string,
  options?: { limit?: number }
): Promise<Notification[]> {
  const limit = options?.limit ?? 50;
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    type: r.type as NotificationType,
    priority: r.priority,
    urgency: r.urgency,
    title: r.title,
    body: r.body,
    relatedEntityType: r.relatedEntityType,
    relatedEntityId: r.relatedEntityId,
    isRead: r.isRead,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
    readAt: r.readAt instanceof Date ? r.readAt.toISOString() : r.readAt,
  }));
}

/** Broadcast notification to all users. Returns count of notifications created. */
export async function broadcastToAllUsers(params: {
  title: string;
  body?: string | null;
  priority?: "low" | "normal" | "high";
  urgency?: "info" | "warning" | "critical";
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
}): Promise<{ count: number }> {
  const allUsers = await db.select({ id: users.id }).from(users);
  if (allUsers.length === 0) return { count: 0 };

  await db.insert(notifications).values(
    allUsers.map((u) => ({
      userId: u.id,
      type: "system_announcement" as const,
      title: params.title,
      body: params.body ?? null,
      priority: params.priority ?? "normal",
      urgency: params.urgency ?? "info",
      relatedEntityType: params.relatedEntityType ?? null,
      relatedEntityId: params.relatedEntityId ?? null,
    }))
  );
  return { count: allUsers.length };
}

/** Get user IDs of participants in a challenge (members of teams that joined the challenge). */
export async function getChallengeParticipantUserIds(
  challengeId: number
): Promise<string[]> {
  const teamsInChallenge = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.challengeId, challengeId));

  const teamIds = teamsInChallenge.map((t) => t.id);
  if (teamIds.length === 0) return [];

  const members = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(
      and(
        inArray(teamMembers.teamId, teamIds),
        isNull(teamMembers.removedAt)
      )
    );

  const uniqueUserIds = new Set(members.map((m) => m.userId));
  return Array.from(uniqueUserIds);
}

/** Broadcast notification regarding a challenge. Can target all users or challenge participants only. */
export async function broadcastRegardingChallenge(params: {
  challengeId: number;
  title: string;
  body?: string | null;
  priority?: "low" | "normal" | "high";
  urgency?: "info" | "warning" | "critical";
  audience: "all" | "participants";
}): Promise<{ count: number }> {
  const userIds =
    params.audience === "all"
      ? (await db.select({ id: users.id }).from(users)).map((u) => u.id)
      : await getChallengeParticipantUserIds(params.challengeId);

  if (userIds.length === 0) return { count: 0 };

  await db.insert(notifications).values(
    userIds.map((userId) => ({
      userId,
      type: "system_announcement" as const,
      title: params.title,
      body: params.body ?? null,
      priority: params.priority ?? "normal",
      urgency: params.urgency ?? "info",
      relatedEntityType: "challenge",
      relatedEntityId: params.challengeId,
    }))
  );
  return { count: userIds.length };
}

/** Mark a notification as read. Only the notification owner can do this. */
export async function markNotificationRead(
  notificationId: number,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, notificationId));
  if (!row) return { error: "Notification not found." };
  if (row.userId !== userId) return { error: "Not allowed to update this notification." };

  const now = new Date();
  await db
    .update(notifications)
    .set({ isRead: true, readAt: now })
    .where(eq(notifications.id, notificationId));
  return { ok: true };
}

/** Delete a notification. Only the notification owner can do this. */
export async function deleteNotification(
  notificationId: number,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, notificationId));
  if (!row) return { error: "Notification not found." };
  if (row.userId !== userId) return { error: "Not allowed to delete this notification." };

  await db.delete(notifications).where(eq(notifications.id, notificationId));
  return { ok: true };
}

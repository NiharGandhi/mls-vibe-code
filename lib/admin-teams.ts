import { db, teams, teamMembers, users } from "@/db";
import { desc, eq, isNull, sql } from "drizzle-orm";

export type AdminTeam = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  maxMembers: number | null;
  challengeId: number | null;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  createdAt: string;
};

export async function getAllTeamsForAdmin(): Promise<AdminTeam[]> {
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      status: teams.status,
      maxMembers: teams.maxMembers,
      challengeId: teams.challengeId,
      ownerId: teams.ownerId,
      ownerName: users.name,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .leftJoin(users, eq(users.id, teams.ownerId))
    .orderBy(desc(teams.createdAt));

  const memberCounts = await db
    .select({
      teamId: teamMembers.teamId,
      count: sql<number>`count(*)::int`,
    })
    .from(teamMembers)
    .where(isNull(teamMembers.removedAt))
    .groupBy(teamMembers.teamId);

  const countMap = new Map(memberCounts.map((r) => [r.teamId, r.count]));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    status: r.status,
    maxMembers: r.maxMembers,
    challengeId: r.challengeId,
    ownerId: r.ownerId,
    ownerName: r.ownerName ?? "Unknown",
    memberCount: countMap.get(r.id) ?? 0,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));
}

export async function updateTeamStatus(
  teamId: number,
  status: "open" | "closed" | "disqualified"
): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .update(teams)
    .set({ status, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning({ id: teams.id });

  if (!row) return { error: "Team not found." };
  return { ok: true };
}

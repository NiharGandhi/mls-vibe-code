import { db, teams, teamMembers, teamJoinRequests, users } from "@/db";
import { eq, and, isNull, sql } from "drizzle-orm";

export type TeamMemberProfile = {
  userId: string;
  name: string;
  email: string;
  yearOfStudy: string | null;
  majorOfStudy: string | null;
  roleInTeam: string;
};

export type TeamWithRole = {
  id: number;
  name: string;
  description: string | null;
  status: string;
  maxMembers: number | null;
  createdAt: string;
  roleInTeam: string;
  memberCount?: number;
  /** Only set when fetching with userId (e.g. all-teams for logged-in user). */
  joinRequestStatus?: "none" | "member" | "pending" | "accepted" | "rejected";
  /** True when the current user is the team owner (from getTeamById). */
  isOwner?: boolean;
};

const DEFAULT_MAX_MEMBERS = 3;

/** Get member counts for each team (active members, removedAt is null). */
async function getMemberCountsByTeamId(): Promise<Map<number, number>> {
  const rows = await db
    .select({
      teamId: teamMembers.teamId,
      count: sql<number>`count(*)::int`,
    })
    .from(teamMembers)
    .where(isNull(teamMembers.removedAt))
    .groupBy(teamMembers.teamId);
  return new Map(rows.map((r) => [r.teamId, r.count]));
}

export async function getAllTeams(userId?: string): Promise<TeamWithRole[]> {
  const allTeams = await db.select().from(teams);
  const countMap = await getMemberCountsByTeamId();

  let memberTeamIds = new Set<number>();
  let joinRequestByTeam = new Map<number, string>();
  if (userId) {
    const memberships = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, userId), isNull(teamMembers.removedAt)));
    memberTeamIds = new Set(memberships.map((m) => m.teamId));
    const requests = await db
      .select({ teamId: teamJoinRequests.teamId, status: teamJoinRequests.status })
      .from(teamJoinRequests)
      .where(eq(teamJoinRequests.requesterUserId, userId));
    joinRequestByTeam = new Map(requests.map((r) => [r.teamId, r.status]));
  }

  return allTeams.map((team) => {
    const memberCount = countMap.get(team.id) ?? 0;
    let joinRequestStatus: TeamWithRole["joinRequestStatus"] = "none";
    if (userId) {
      if (memberTeamIds.has(team.id)) joinRequestStatus = "member";
      else joinRequestStatus = (joinRequestByTeam.get(team.id) as TeamWithRole["joinRequestStatus"]) ?? "none";
    }
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      status: team.status,
      maxMembers: team.maxMembers,
      createdAt:
        team.createdAt instanceof Date ? team.createdAt.toISOString() : String(team.createdAt),
      roleInTeam: "owner",
      memberCount,
      joinRequestStatus,
    };
  });
}

export async function getTeamsForUser(userId: string): Promise<TeamWithRole[]> {
  const memberships = await db
    .select({
      teamId: teamMembers.teamId,
      roleInTeam: teamMembers.roleInTeam,
      teamName: teams.name,
      teamDescription: teams.description,
      teamStatus: teams.status,
      teamMaxMembers: teams.maxMembers,
      teamCreatedAt: teams.createdAt,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(and(eq(teamMembers.userId, userId), isNull(teamMembers.removedAt)));

  const teamsList: TeamWithRole[] = await Promise.all(
    memberships.map(async (m) => {
      const activeMembers = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, m.teamId), isNull(teamMembers.removedAt)));
      return {
        id: m.teamId,
        name: m.teamName,
        description: m.teamDescription,
        status: m.teamStatus,
        maxMembers: m.teamMaxMembers,
        createdAt:
          m.teamCreatedAt instanceof Date
            ? m.teamCreatedAt.toISOString()
            : String(m.teamCreatedAt),
        roleInTeam: m.roleInTeam,
        memberCount: activeMembers.length,
      };
    })
  );

  return teamsList;
}

export type TeamOwnedForChallenge = {
  id: number;
  name: string;
  challengeId: number | null;
  memberCount: number;
};

/** Team the user is in for a specific challenge (any member). */
export type TeamInChallenge = {
  id: number;
  name: string;
  isOwner: boolean;
};

/** Get the team the user belongs to that is enrolled in this challenge, or null. */
export async function getTeamForUserInChallenge(
  userId: string,
  challengeId: number
): Promise<TeamInChallenge | null> {
  const [row] = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      ownerId: teams.ownerId,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teams.challengeId, challengeId),
        isNull(teamMembers.removedAt)
      )
    )
    .limit(1);
  if (!row) return null;
  return {
    id: row.teamId,
    name: row.teamName,
    isOwner: row.ownerId === userId,
  };
}

/** Get teams owned by the user, for joining challenges. */
export async function getTeamsOwnedByUser(userId: string): Promise<TeamOwnedForChallenge[]> {
  const rows = await db
    .select({
      id: teams.id,
      name: teams.name,
      challengeId: teams.challengeId,
    })
    .from(teams)
    .where(eq(teams.ownerId, userId));

  const countMap = await getMemberCountsByTeamId();

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    challengeId: r.challengeId,
    memberCount: countMap.get(r.id) ?? 0,
  }));
}

/** Case-insensitive check if a team name is already taken. */
export async function isTeamNameAvailable(name: string): Promise<boolean> {
  const trimmed = name?.trim();
  if (!trimmed) return false;
  const [existing] = await db
    .select({ id: teams.id })
    .from(teams)
    .where(sql`lower(${teams.name}) = lower(${trimmed})`)
    .limit(1);
  return !existing;
}

export async function createTeamForUser(
  userId: string,
  data: { name: string; description?: string | null }
): Promise<{ id: number } | { error: string }> {
  const name = data.name?.trim();
  if (!name || name.length > 150) {
    return { error: "Team name is required (max 150 characters)." };
  }
  if (!(await isTeamNameAvailable(name))) {
    return { error: "Team name is already taken." };
  }

  const [team] = await db
    .insert(teams)
    .values({
      name,
      description: data.description?.trim() || null,
      ownerId: userId,
      status: "open",
      maxMembers: DEFAULT_MAX_MEMBERS,
    })
    .returning({ id: teams.id });

  if (!team) {
    return { error: "Failed to create team." };
  }

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    roleInTeam: "owner",
  });

  return { id: team.id };
}

export async function getTeamById(
  teamId: number,
  userId?: string
): Promise<TeamWithRole | null> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return null;

  const memberCount = (await getMemberCountsByTeamId()).get(teamId) ?? 0;
  let joinRequestStatus: TeamWithRole["joinRequestStatus"] = "none";
  if (userId) {
    const isMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, userId),
          isNull(teamMembers.removedAt)
        )
      );
    if (isMember.length > 0) joinRequestStatus = "member";
    else {
      const [req] = await db
        .select({ status: teamJoinRequests.status })
        .from(teamJoinRequests)
        .where(
          and(
            eq(teamJoinRequests.teamId, teamId),
            eq(teamJoinRequests.requesterUserId, userId)
          )
        );
      if (req) joinRequestStatus = req.status as TeamWithRole["joinRequestStatus"];
    }
  }

  const isOwner = userId != null && team.ownerId === userId;

  return {
    id: team.id,
    name: team.name,
    description: team.description,
    status: team.status,
    maxMembers: team.maxMembers,
    createdAt:
      team.createdAt instanceof Date ? team.createdAt.toISOString() : String(team.createdAt),
    roleInTeam: "owner",
    memberCount,
    joinRequestStatus,
    isOwner,
  };
}

/** Get team members with user profiles (active members only). */
export async function getTeamMembersWithProfiles(
  teamId: number
): Promise<TeamMemberProfile[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      yearOfStudy: users.yearOfStudy,
      majorOfStudy: users.majorOfStudy,
      roleInTeam: teamMembers.roleInTeam,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(
      and(eq(teamMembers.teamId, teamId), isNull(teamMembers.removedAt))
    );
  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    yearOfStudy: r.yearOfStudy,
    majorOfStudy: r.majorOfStudy,
    roleInTeam: r.roleInTeam,
  }));
}

/** Create a join request (user requests to join team). Owner can approve later. */
export async function createJoinRequest(
  userId: string,
  teamId: number
): Promise<{ ok: true; requestId: number } | { error: string }> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };

  const existing = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId), isNull(teamMembers.removedAt))
    );
  if (existing.length > 0) return { error: "You are already a member." };

  const pending = await db
    .select()
    .from(teamJoinRequests)
    .where(
      and(
        eq(teamJoinRequests.teamId, teamId),
        eq(teamJoinRequests.requesterUserId, userId),
        eq(teamJoinRequests.status, "pending")
      )
    );
  if (pending.length > 0) return { error: "You already have a pending request." };

  const countMap = await getMemberCountsByTeamId();
  const memberCount = countMap.get(teamId) ?? 0;
  const max = team.maxMembers ?? 999;
  if (memberCount >= max) return { error: "Team is full." };

  const [inserted] = await db
    .insert(teamJoinRequests)
    .values({
      teamId,
      requesterUserId: userId,
      status: "pending",
    })
    .returning({ id: teamJoinRequests.id });
  return { ok: true, requestId: inserted!.id };
}

/** Owner only: resolve a join request (accept or reject). */
export async function resolveJoinRequest(
  requestId: number,
  action: "accept" | "reject",
  requestedByUserId: string
): Promise<{ ok: true } | { error: string }> {
  const [request] = await db
    .select()
    .from(teamJoinRequests)
    .where(eq(teamJoinRequests.id, requestId));
  if (!request || request.status !== "pending") {
    return { error: "Join request not found or already resolved." };
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, request.teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== requestedByUserId) {
    return { error: "Only the team owner can accept or reject join requests." };
  }

  const now = new Date();
  if (action === "reject") {
    await db
      .update(teamJoinRequests)
      .set({ status: "rejected", decidedAt: now })
      .where(eq(teamJoinRequests.id, requestId));
    return { ok: true };
  }

  const countMap = await getMemberCountsByTeamId();
  const memberCount = countMap.get(request.teamId) ?? 0;
  const max = team.maxMembers ?? 999;
  if (memberCount >= max) return { error: "Team is full." };

  await db.insert(teamMembers).values({
    teamId: request.teamId,
    userId: request.requesterUserId,
    roleInTeam: "member",
  });
  await db
    .update(teamJoinRequests)
    .set({ status: "accepted", decidedAt: now })
    .where(eq(teamJoinRequests.id, requestId));
  return { ok: true };
}

/** Owner only: remove a member from the team (soft delete). Owner cannot remove themselves. */
export async function removeTeamMember(
  teamId: number,
  memberUserId: string,
  requestedByUserId: string
): Promise<{ ok: true } | { error: string }> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== requestedByUserId) return { error: "Only the team owner can remove members." };
  if (memberUserId === requestedByUserId) return { error: "You cannot remove yourself." };

  await db
    .update(teamMembers)
    .set({ removedAt: new Date() })
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId))
    );
  return { ok: true };
}

/** Owner only: update a member's role (e.g. promote to lead or demote to member). Cannot change the owner's role. */
export async function updateMemberRole(
  teamId: number,
  memberUserId: string,
  newRole: string,
  requestedByUserId: string
): Promise<{ ok: true } | { error: string }> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== requestedByUserId) return { error: "Only the team owner can change roles." };
  if (memberUserId === team.ownerId) return { error: "Cannot change the owner's role." };
  const role = newRole?.trim().toLowerCase();
  if (role !== "member" && role !== "lead") return { error: "Role must be 'member' or 'lead'." };

  await db
    .update(teamMembers)
    .set({ roleInTeam: role })
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId))
    );
  return { ok: true };
}

/** Owner only: delete the team. Related data (members, join requests, submissions, etc.) is removed by DB cascade. */
export async function deleteTeam(
  teamId: number,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== userId) return { error: "Only the team owner can delete the team." };

  await db.delete(teams).where(eq(teams.id, teamId));
  return { ok: true };
}
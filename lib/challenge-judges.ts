import { db, challengeRoles, users } from "@/db";
import { eq, and } from "drizzle-orm";

export type ChallengeJudge = {
  id: number;
  userId: string;
  name: string | null;
  email: string | null;
};

export async function getJudgesForChallenge(
  challengeId: number
): Promise<ChallengeJudge[]> {
  const rows = await db
    .select({
      id: challengeRoles.id,
      userId: challengeRoles.userId,
      name: users.name,
      email: users.email,
    })
    .from(challengeRoles)
    .innerJoin(users, eq(users.id, challengeRoles.userId))
    .where(
      and(
        eq(challengeRoles.challengeId, challengeId),
        eq(challengeRoles.role, "judge")
      )
    );

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    email: r.email,
  }));
}

export async function addJudgeToChallenge(
  challengeId: number,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const [existing] = await db
    .select({ id: challengeRoles.id })
    .from(challengeRoles)
    .where(
      and(
        eq(challengeRoles.challengeId, challengeId),
        eq(challengeRoles.userId, userId),
        eq(challengeRoles.role, "judge")
      )
    );
  if (existing) return { error: "User is already a judge for this challenge." };

  await db.insert(challengeRoles).values({
    challengeId,
    userId,
    role: "judge",
  });
  return { ok: true };
}

export async function removeJudgeFromChallenge(
  challengeId: number,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .delete(challengeRoles)
    .where(
      and(
        eq(challengeRoles.challengeId, challengeId),
        eq(challengeRoles.userId, userId),
        eq(challengeRoles.role, "judge")
      )
    )
    .returning({ id: challengeRoles.id });
  return row ? { ok: true } : { error: "Judge not found." };
}

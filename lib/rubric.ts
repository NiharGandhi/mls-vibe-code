import { db, rubricCriteria } from "@/db";
import { eq, asc } from "drizzle-orm";

export type RubricCriterion = {
  id: number;
  challengeId: number;
  sortOrder: number;
  label: string;
  description: string | null;
  maxPoints: number;
  createdAt: string;
};

export async function getRubricCriteriaByChallengeId(
  challengeId: number
): Promise<RubricCriterion[]> {
  const rows = await db
    .select()
    .from(rubricCriteria)
    .where(eq(rubricCriteria.challengeId, challengeId))
    .orderBy(asc(rubricCriteria.sortOrder), asc(rubricCriteria.id));

  return rows.map((r) => ({
    id: r.id,
    challengeId: r.challengeId,
    sortOrder: r.sortOrder,
    label: r.label,
    description: r.description,
    maxPoints: r.maxPoints,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));
}

export async function createRubricCriterion(
  challengeId: number,
  data: { label: string; description?: string | null; maxPoints?: number; sortOrder?: number }
): Promise<{ id: number } | { error: string }> {
  const label = data.label?.trim();
  if (!label || label.length > 200) return { error: "Label is required (max 200 characters)." };
  const maxPoints = Math.max(0, Math.min(100, data.maxPoints ?? 10));
  const sortOrder = data.sortOrder ?? 0;

  const [row] = await db
    .insert(rubricCriteria)
    .values({
      challengeId,
      label,
      description: data.description?.trim() || null,
      maxPoints,
      sortOrder,
    })
    .returning({ id: rubricCriteria.id });

  if (!row) return { error: "Failed to create criterion." };
  return { id: row.id };
}

export async function updateRubricCriterion(
  id: number,
  data: { label?: string; description?: string | null; maxPoints?: number; sortOrder?: number }
): Promise<{ ok: true } | { error: string }> {
  const values: Record<string, unknown> = {};
  if (data.label != null) {
    const t = data.label.trim();
    if (!t || t.length > 200) return { error: "Label must be 1–200 characters." };
    values.label = t;
  }
  if (data.description !== undefined) values.description = data.description?.trim() || null;
  if (data.maxPoints !== undefined)
    values.maxPoints = Math.max(0, Math.min(100, data.maxPoints));
  if (data.sortOrder !== undefined) values.sortOrder = data.sortOrder;

  const [row] = await db
    .update(rubricCriteria)
    .set(values as Record<string, never>)
    .where(eq(rubricCriteria.id, id))
    .returning({ id: rubricCriteria.id });

  if (!row) return { error: "Criterion not found." };
  return { ok: true };
}

export async function deleteRubricCriterion(id: number): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .delete(rubricCriteria)
    .where(eq(rubricCriteria.id, id))
    .returning({ id: rubricCriteria.id });
  if (!row) return { error: "Criterion not found." };
  return { ok: true };
}

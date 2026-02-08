"use server";

import { getSession } from "@/lib/auth/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export type SyncUserProfile = {
  yearOfStudy?: string | null;
  majorOfStudy?: string | null;
  /** ISO date string (YYYY-MM-DD) from date input */
  dob?: string | null;
  /** Profile/avatar image URL (uploaded or preset avatar). */
  imageUrl?: string | null;
};

/**
 * Upsert user into app's `users` table using sign-up data (no session required).
 * Use this right after sign-up when requireEmailVerification is true, since there is no session yet.
 */
export async function upsertUserOnSignUp(
  params: {
    userId: string;
    name: string;
    email: string;
  } & SyncUserProfile
): Promise<{ ok: boolean; error?: string }> {
  const { userId, name, email } = params;
  const now = new Date();

  const dobDate =
    params.dob && params.dob.trim()
      ? new Date(params.dob.trim() + "T00:00:00.000Z")
      : null;
  const yearOfStudy =
    params.yearOfStudy?.trim() && params.yearOfStudy.length <= 20
      ? params.yearOfStudy.trim()
      : null;
  const majorOfStudy =
    params.majorOfStudy?.trim() && params.majorOfStudy.length <= 100
      ? params.majorOfStudy.trim()
      : null;

  try {
    await db
      .insert(users)
      .values({
        id: userId,
        name: name || "",
        email,
        lastLoginAt: now,
        updatedAt: now,
        ...(yearOfStudy != null && { yearOfStudy }),
        ...(majorOfStudy != null && { majorOfStudy }),
        ...(dobDate != null && !Number.isNaN(dobDate.getTime()) && { dob: dobDate }),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: name || "",
          email,
          updatedAt: now,
          yearOfStudy: yearOfStudy ?? null,
          majorOfStudy: majorOfStudy ?? null,
          dob: dobDate != null && !Number.isNaN(dobDate.getTime()) ? dobDate : null,
        },
      });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save profile";
    return { ok: false, error: message };
  }
}

/**
 * Ensures the current Better Auth user exists in the app's `users` table.
 * Call this after sign-in/sign-up so your DB stays in sync with Better Auth.
 * Pass optional profile fields (e.g. from sign-up form) to set yearOfStudy, majorOfStudy, dob.
 */
export async function syncUserToDb(
  profile?: SyncUserProfile | null
): Promise<{ ok: boolean; error?: string }> {
  const { data: session } = await getSession();
  if (!session?.user) {
    return { ok: false, error: "No session" };
  }

  const { id, name, email } = session.user;
  const now = new Date();

  const dobDate =
    profile?.dob && profile.dob.trim()
      ? new Date(profile.dob.trim() + "T00:00:00.000Z")
      : null;
  const yearOfStudy =
    profile?.yearOfStudy?.trim() && profile.yearOfStudy.length <= 20
      ? profile.yearOfStudy.trim()
      : null;
  const majorOfStudy =
    profile?.majorOfStudy?.trim() && profile.majorOfStudy.length <= 100
      ? profile.majorOfStudy.trim()
      : null;

  const insertValues = {
    id,
    name: name ?? "",
    email,
    lastLoginAt: now,
    updatedAt: now,
    ...(yearOfStudy != null && { yearOfStudy }),
    ...(majorOfStudy != null && { majorOfStudy }),
    ...(dobDate != null && !Number.isNaN(dobDate.getTime()) && { dob: dobDate }),
  };

  const conflictSet = {
    name: name ?? "",
    email,
    lastLoginAt: now,
    updatedAt: now,
    // Only update profile fields when explicitly passed (e.g. from sign-up form)
    ...(profile != null && {
      yearOfStudy: yearOfStudy ?? null,
      majorOfStudy: majorOfStudy ?? null,
      dob: dobDate != null && !Number.isNaN(dobDate.getTime()) ? dobDate : null,
    }),
  };

  try {
    await db
      .insert(users)
      .values(insertValues)
      .onConflictDoUpdate({
        target: users.id,
        set: conflictSet,
      });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sync user";
    return { ok: false, error: message };
  }
}

/**
 * Update the current user's profile fields (yearOfStudy, majorOfStudy, dob) in the app's users table.
 * For name/image use authClient.updateUser() on the client.
 */
export async function updateAppProfile(
  profile: SyncUserProfile
): Promise<{ ok: boolean; error?: string }> {
  const { data: session } = await getSession();
  if (!session?.user) {
    return { ok: false, error: "No session" };
  }

  const dobDate =
    profile.dob !== undefined && profile.dob?.trim()
      ? new Date(profile.dob.trim() + "T00:00:00.000Z")
      : undefined;
  const yearOfStudy =
    profile.yearOfStudy !== undefined
      ? (profile.yearOfStudy?.trim() && profile.yearOfStudy.length <= 20
          ? profile.yearOfStudy.trim()
          : null)
      : undefined;
  const majorOfStudy =
    profile.majorOfStudy !== undefined
      ? (profile.majorOfStudy?.trim() && profile.majorOfStudy.length <= 100
          ? profile.majorOfStudy.trim()
          : null)
      : undefined;

  const imageUrl =
    profile.imageUrl !== undefined
      ? (profile.imageUrl?.trim() && profile.imageUrl.length <= 500
          ? profile.imageUrl.trim()
          : null)
      : undefined;

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
    ...(yearOfStudy !== undefined && { yearOfStudy }),
    ...(majorOfStudy !== undefined && { majorOfStudy }),
    ...(dobDate !== undefined && {
      dob: dobDate != null && !Number.isNaN(dobDate.getTime()) ? dobDate : null,
    }),
    ...(imageUrl !== undefined && { imageUrl }),
  };

  try {
    await db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, session.user.id));
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return { ok: false, error: message };
  }
}

/** Get the current user's app profile (for settings / profile page). */
export async function getAppProfile(): Promise<{
  ok: boolean;
  profile?: SyncUserProfile & { name?: string; email?: string; imageUrl?: string | null };
  error?: string;
}> {
  const { data: session } = await getSession();
  if (!session?.user) {
    return { ok: false, error: "No session" };
  }
  const rows = await db
    .select({
      name: users.name,
      email: users.email,
      imageUrl: users.imageUrl,
      yearOfStudy: users.yearOfStudy,
      majorOfStudy: users.majorOfStudy,
      dob: users.dob,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return {
      ok: true,
      profile: {
        name: session.user.name ?? undefined,
        email: session.user.email ?? undefined,
      },
    };
  }
  const dob =
    row.dob instanceof Date
      ? row.dob.toISOString().slice(0, 10)
      : row.dob != null
        ? String(row.dob).slice(0, 10)
        : undefined;
  return {
    ok: true,
    profile: {
      name: row.name ?? session.user.name ?? undefined,
      email: row.email ?? session.user.email ?? undefined,
      imageUrl: row.imageUrl ?? undefined,
      yearOfStudy: row.yearOfStudy ?? undefined,
      majorOfStudy: row.majorOfStudy ?? undefined,
      dob: dob ?? undefined,
    },
  };
}

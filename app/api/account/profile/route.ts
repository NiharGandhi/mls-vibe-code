import { getAppProfile } from "@/lib/auth/sync-user";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns the current user's app profile (e.g. imageUrl for avatar). */
export async function GET() {
  const result = await getAppProfile();
  if (!result.ok || !result.profile) {
    return NextResponse.json(
      { error: result.error ?? "Unauthorized" },
      { status: result.ok ? 404 : 401 }
    );
  }
  return NextResponse.json({
    profile: {
      imageUrl: result.profile.imageUrl ?? null,
      name: result.profile.name ?? null,
      email: result.profile.email ?? null,
    },
  });
}

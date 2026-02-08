import { getSession } from "@/lib/auth/server";
import { db, challenges, teams } from "@/db";
import { eq } from "drizzle-orm";
import { uploadSubmissionFile } from "@/lib/r2";
import { SUBMISSION_TYPE_SLUGS, type SubmissionTypeSlug } from "@/db/schema";
import { isFileSubmissionType } from "@/lib/submission-types";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_PITCH_DECK = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
const ALLOWED_WORD = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];

function getAllowedTypes(slug: SubmissionTypeSlug): string[] {
  if (slug === "pitch_deck") return ALLOWED_PITCH_DECK;
  if (slug === "word_doc") return ALLOWED_WORD;
  if (slug === "video") return ALLOWED_VIDEO;
  return [];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challengeId = parseInt((await params).id, 10);
  if (Number.isNaN(challengeId)) {
    return Response.json({ error: "Invalid challenge ID" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const teamIdRaw = formData.get("teamId");
  const teamId = teamIdRaw ? parseInt(String(teamIdRaw), 10) : null;
  const typeSlug = formData.get("type") as string | null;
  const file = formData.get("file") as File | null;

  if (!teamId || Number.isNaN(teamId) || !typeSlug || !file || !(file instanceof File)) {
    return Response.json(
      { error: "Missing teamId, type, or file." },
      { status: 400 }
    );
  }

  if (!SUBMISSION_TYPE_SLUGS.includes(typeSlug as SubmissionTypeSlug) || !isFileSubmissionType(typeSlug)) {
    return Response.json({ error: "Invalid or non-file submission type." }, { status: 400 });
  }

  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
  if (!challenge) {
    return Response.json({ error: "Challenge not found." }, { status: 404 });
  }
  if (challenge.status === "finished") {
    return Response.json({ error: "This challenge has ended." }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team || team.challengeId !== challengeId) {
    return Response.json({ error: "Team not found or not registered for this challenge." }, { status: 400 });
  }
  if (team.ownerId !== session.user.id) {
    return Response.json({ error: "Only the team owner can submit for this team." }, { status: 403 });
  }

  const allowedMime = getAllowedTypes(typeSlug as SubmissionTypeSlug);
  const contentType = file.type || "application/octet-stream";
  if (allowedMime.length && !allowedMime.includes(contentType)) {
    return Response.json(
      { error: `Invalid file type. Allowed: ${allowedMime.join(", ")}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File too large (max 100 MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadSubmissionFile(
    challengeId,
    teamId,
    typeSlug,
    file.name,
    buffer,
    contentType
  );

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ url: result.url, key: result.key });
}

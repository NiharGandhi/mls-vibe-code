import type { SubmissionTypeSlug } from "@/db/schema";

export type SubmissionPayload = {
  pitchDeckUrl?: string;
  wordDocUrl?: string;
  videoUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
};

const SLUG_TO_KEY: Record<SubmissionTypeSlug, keyof SubmissionPayload> = {
  pitch_deck: "pitchDeckUrl",
  word_doc: "wordDocUrl",
  video: "videoUrl",
  url_github: "githubUrl",
  url_live: "liveUrl",
};

export function slugToPayloadKey(slug: SubmissionTypeSlug): keyof SubmissionPayload {
  return SLUG_TO_KEY[slug];
}

export function getPayloadKeyForSlug(slug: string): keyof SubmissionPayload | null {
  return (SLUG_TO_KEY as Record<string, keyof SubmissionPayload>)[slug] ?? null;
}

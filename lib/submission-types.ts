import {
  SUBMISSION_TYPE_SLUGS,
  SUBMISSION_TYPE_ALL,
  type SubmissionTypeSlug,
} from "@/db/schema";

export const SUBMISSION_TYPE_LABELS: Record<SubmissionTypeSlug | typeof SUBMISSION_TYPE_ALL, string> = {
  pitch_deck: "Pitch deck",
  word_doc: "Word document",
  video: "Video",
  url_github: "GitHub / repo URL",
  url_live: "Live / demo URL",
  all: "All of the above",
};

/** If challenge has ["all"], return all file/URL types; otherwise return the configured array (filtered to valid slugs). */
export function getEffectiveSubmissionTypes(types: string[] | null | undefined): SubmissionTypeSlug[] {
  if (!types || types.length === 0) return [];
  if (types.includes(SUBMISSION_TYPE_ALL)) return [...SUBMISSION_TYPE_SLUGS];
  return types.filter((t): t is SubmissionTypeSlug =>
    SUBMISSION_TYPE_SLUGS.includes(t as SubmissionTypeSlug)
  );
}

/** Types that require file upload (not just a URL field). */
export const FILE_SUBMISSION_SLUGS: SubmissionTypeSlug[] = ["pitch_deck", "word_doc", "video"];

/** Types that are URL-only (user pastes a link). */
export const URL_ONLY_SLUGS: SubmissionTypeSlug[] = ["url_github", "url_live"];

export function isFileSubmissionType(slug: string): boolean {
  return FILE_SUBMISSION_SLUGS.includes(slug as SubmissionTypeSlug);
}

export function isUrlOnlySubmissionType(slug: string): boolean {
  return URL_ONLY_SLUGS.includes(slug as SubmissionTypeSlug);
}

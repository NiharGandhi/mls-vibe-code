import { getSession } from "@/lib/auth/server";
import { getAdminRole, canJudgeSubmissions, isJudgeForChallenge } from "@/lib/admin";
import { getSubmissionByIdForAdmin } from "@/lib/admin-submissions";
import { getTabulatedScore, getSubmissionScores } from "@/lib/submission-scores";
import { getRubricCriteriaByChallengeId } from "@/lib/rubric";
import {
  getJudgeFeedbackForSubmission,
  getJudgeFeedbackForSubmissionByJudge,
} from "@/lib/judge-feedback";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SUBMISSION_TYPE_LABELS } from "@/lib/submission-types";
import type { SubmissionPayload } from "@/lib/submission-payload";
import { AdminSubmissionDetailView } from "./AdminSubmissionDetailView";

const PAYLOAD_KEYS = [
  "pitchDeckUrl",
  "wordDocUrl",
  "videoUrl",
  "githubUrl",
  "liveUrl",
] as const;
const PAYLOAD_LABELS: Record<string, string> = {
  pitchDeckUrl: SUBMISSION_TYPE_LABELS.pitch_deck,
  wordDocUrl: SUBMISSION_TYPE_LABELS.word_doc,
  videoUrl: SUBMISSION_TYPE_LABELS.video,
  githubUrl: SUBMISSION_TYPE_LABELS.url_github,
  liveUrl: SUBMISSION_TYPE_LABELS.url_live,
};

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canJudgeSubmissions(role)) redirect("/admin");

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) redirect("/admin/submissions");

  const submission = await getSubmissionByIdForAdmin(id);
  if (!submission) notFound();

  const payload = (submission.payload || {}) as SubmissionPayload;
  const rubricCriteria = await getRubricCriteriaByChallengeId(submission.challengeId);
  const scores = await getSubmissionScores(id);
  const tabulated = await getTabulatedScore(id);
  const isJudge = await isJudgeForChallenge(session.user.id, submission.challengeId);
  const allJudgeFeedback = await getJudgeFeedbackForSubmission(id);
  const currentJudgeFeedback =
    (await getJudgeFeedbackForSubmissionByJudge(id, session.user.id)) ?? "";

  type EmbedType = "pdf" | "doc" | "video" | null;
  const payloadEntries = PAYLOAD_KEYS.filter((k) => payload[k]?.trim()).map((k) => {
    const url = payload[k]!.trim();
    const isFile =
      k === "pitchDeckUrl" || k === "wordDocUrl" || k === "videoUrl";
    const embedType: EmbedType = isFile
      ? k === "videoUrl"
        ? "video"
        : k === "pitchDeckUrl"
          ? "pdf"
          : "doc"
      : null;
    return {
      key: k,
      label: PAYLOAD_LABELS[k] ?? k,
      url,
      embedType,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to submissions
      </Link>

      <AdminSubmissionDetailView
        submission={submission}
        payloadEntries={payloadEntries}
        rubricCriteria={rubricCriteria}
        scores={scores}
        tabulated={tabulated}
        currentUserId={session.user.id}
        isJudge={isJudge}
        currentJudgeFeedback={currentJudgeFeedback}
        allJudgeFeedback={allJudgeFeedback}
      />
    </div>
  );
}

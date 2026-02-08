"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import type { AdminSubmission } from "@/lib/admin-submissions";
import type { RubricCriterion } from "@/lib/rubric";
import type { SubmissionScoreRow } from "@/lib/submission-scores";

type PayloadEntry = {
  key: string;
  label: string;
  url: string;
  embedType?: "pdf" | "doc" | "video" | null;
};
type Tabulated = {
  averageTotal: number;
  judgeCount: number;
  judgeTotals: { userId: string; judgeName: string | null; total: number }[];
};

type JudgeFeedbackRow = { userId: string; judgeName: string | null; feedback: string | null };

interface AdminSubmissionDetailViewProps {
  submission: AdminSubmission;
  payloadEntries: PayloadEntry[];
  rubricCriteria: RubricCriterion[];
  scores: SubmissionScoreRow[];
  tabulated: Tabulated;
  currentUserId: string;
  isJudge: boolean;
  currentJudgeFeedback: string;
  allJudgeFeedback: JudgeFeedbackRow[];
}

export function AdminSubmissionDetailView({
  submission,
  payloadEntries,
  rubricCriteria,
  scores,
  tabulated,
  currentUserId,
  isJudge,
  currentJudgeFeedback,
  allJudgeFeedback,
}: AdminSubmissionDetailViewProps) {
  const router = useRouter();
  const [judgeFeedback, setJudgeFeedback] = useState(currentJudgeFeedback);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [judgeScores, setJudgeScores] = useState<Record<number, number>>(() => {
    const byCriterion: Record<number, number> = {};
    scores
      .filter((s) => s.userId === currentUserId)
      .forEach((s) => {
        byCriterion[s.rubricCriterionId] = s.score;
      });
    return byCriterion;
  });
  const [savingScores, setSavingScores] = useState(false);

  useEffect(() => {
    const byCriterion: Record<number, number> = {};
    scores
      .filter((s) => s.userId === currentUserId)
      .forEach((s) => {
        byCriterion[s.rubricCriterionId] = s.score;
      });
    setJudgeScores(byCriterion);
  }, [scores, currentUserId]);

  useEffect(() => {
    setJudgeFeedback(currentJudgeFeedback);
  }, [currentJudgeFeedback]);

  async function handleSaveFeedback() {
    setSavingFeedback(true);
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: judgeFeedback }),
      });
      if (res.ok) router.refresh();
    } finally {
      setSavingFeedback(false);
    }
  }

  async function handleSaveScores() {
    setSavingScores(true);
    try {
      await Promise.all(
        rubricCriteria.map((c) =>
          fetch(`/api/admin/submissions/${submission.id}/scores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rubricCriterionId: c.id,
              score: judgeScores[c.id] ?? 0,
            }),
          })
        )
      );
      router.refresh();
    } finally {
      setSavingScores(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Submission details
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submission.challengeTitle} · {submission.teamName}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Challenge</span>
              <p className="font-medium">{submission.challengeTitle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Team</span>
              <p className="font-medium">{submission.teamName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Submitted by</span>
              <p className="font-medium">{submission.submittedByName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date</span>
              <p className="font-medium">
                {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submitted work</CardTitle>
          <p className="text-sm text-muted-foreground">
            Links and files submitted by the team. PDFs, docs, and videos are shown inline.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {payloadEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No links or files.</p>
          ) : (
            payloadEntries.map(({ key, label, url, embedType }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  {key === "githubUrl" || key === "liveUrl" ? (
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{label}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-primary underline hover:no-underline"
                  >
                    Open in new tab
                  </a>
                </div>
                {embedType === "video" && (
                  <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                    <video
                      src={url}
                      controls
                      className="w-full max-h-[400px]"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {embedType === "pdf" && (
                  <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                    {/\.(pptx?|docx?)$/i.test(url) ? (
                      <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                        title={label}
                        className="w-full h-[500px]"
                      />
                    ) : (
                      <iframe
                        src={url}
                        title={label}
                        className="w-full h-[500px]"
                      />
                    )}
                  </div>
                )}
                {embedType === "doc" && (
                  <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                      title={label}
                      className="w-full h-[500px]"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {(rubricCriteria.length > 0 || tabulated.judgeCount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rubric scores</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabulated average: {tabulated.averageTotal.toFixed(1)} (
              {tabulated.judgeCount} judge{tabulated.judgeCount !== 1 ? "s" : ""})
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {tabulated.judgeTotals.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">
                        Judge
                      </th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabulated.judgeTotals.map((j) => (
                      <tr key={j.userId} className="border-b border-border/50">
                        <td className="py-2 pr-4">
                          {j.judgeName ?? j.userId}
                        </td>
                        <td className="py-2 text-right">{j.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {rubricCriteria.length > 0 && scores.length > 0 && tabulated.judgeTotals.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">
                        Criterion
                      </th>
                      <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">
                        Max
                      </th>
                      {tabulated.judgeTotals.map((j) => (
                        <th key={j.userId} className="pb-2 text-right font-medium text-muted-foreground">
                          {j.judgeName ?? "Judge"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rubricCriteria.map((c) => {
                      const judgeOrder = tabulated.judgeTotals.map((j) => j.userId);
                      return (
                        <tr key={c.id} className="border-b border-border/50">
                          <td className="py-2 pr-4 font-medium">{c.label}</td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {c.maxPoints}
                          </td>
                          {judgeOrder.map((uid) => {
                            const s = scores.find(
                              (x) => x.rubricCriterionId === c.id && x.userId === uid
                            );
                            return (
                              <td key={uid} className="py-2 text-right">
                                {s ? s.score : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {rubricCriteria.length > 0 && !tabulated.judgeCount && (
              <p className="text-sm text-muted-foreground">
                No judge scores yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {isJudge && rubricCriteria.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your scores</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill the rubric for this submission. Scores are saved when you click Save.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {rubricCriteria.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium">
                    {c.label}
                    <span className="ml-1 text-muted-foreground">
                      (0–{c.maxPoints})
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={c.maxPoints}
                    value={judgeScores[c.id] ?? ""}
                    onChange={(e) =>
                      setJudgeScores((prev) => ({
                        ...prev,
                        [c.id]: e.target.value === "" ? 0 : parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-20 rounded border border-input bg-background px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleSaveScores} disabled={savingScores}>
              {savingScores ? "Saving…" : "Save scores"}
            </Button>
            <div className="border-t border-border pt-4">
              <label className="mb-2 block text-sm font-medium">
                Your feedback (optional)
              </label>
              <textarea
                value={judgeFeedback}
                onChange={(e) => setJudgeFeedback(e.target.value)}
                placeholder="Optional feedback for the team"
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handleSaveFeedback}
                disabled={savingFeedback}
              >
                {savingFeedback ? "Saving…" : "Save feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {allJudgeFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Judge feedback</CardTitle>
            <p className="text-sm text-muted-foreground">
              Optional feedback from judges for this submission.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {allJudgeFeedback.map((j) => (
                <li key={j.userId} className="rounded-lg border border-border/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {j.judgeName ?? j.userId}
                  </p>
                  <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                    {j.feedback ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

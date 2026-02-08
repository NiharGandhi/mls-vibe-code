"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";
import type { SubmissionPayload } from "@/lib/submission-payload";
import { SUBMISSION_TYPE_LABELS } from "@/lib/submission-types";

interface SubmissionReadOnlyViewProps {
  challengeId: number;
  teamId: number;
  teamName: string;
}

export function SubmissionReadOnlyView({
  challengeId,
  teamId,
  teamName,
}: SubmissionReadOnlyViewProps) {
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<{
    payload: SubmissionPayload;
    submittedAt: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/challenges/${challengeId}/submissions?teamId=${teamId}`
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.submission?.payload) {
          setSubmission({
            payload: data.submission.payload,
            submittedAt: data.submission.submittedAt ?? null,
          });
        } else {
          setSubmission(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [challengeId, teamId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  if (!submission) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            No submission yet. Only the team owner can submit. Ask your team
            owner to go to this page and submit.
          </p>
        </CardContent>
      </Card>
    );
  }

  const keys = [
    "pitchDeckUrl",
    "wordDocUrl",
    "videoUrl",
    "githubUrl",
    "liveUrl",
  ] as const;
  const keyToLabel: Record<string, string> = {
    pitchDeckUrl: SUBMISSION_TYPE_LABELS.pitch_deck,
    wordDocUrl: SUBMISSION_TYPE_LABELS.word_doc,
    videoUrl: SUBMISSION_TYPE_LABELS.video,
    githubUrl: SUBMISSION_TYPE_LABELS.url_github,
    liveUrl: SUBMISSION_TYPE_LABELS.url_live,
  };

  const entries = keys
    .filter((k) => submission.payload[k]?.trim())
    .map((k) => ({
      key: k,
      label: keyToLabel[k] ?? k,
      url: submission.payload[k]!.trim(),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current submission</CardTitle>
        {submission.submittedAt && (
          <p className="text-sm text-muted-foreground">
            Submitted{" "}
            {new Date(submission.submittedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No files or links submitted yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map(({ key, label, url }) => (
              <li key={key} className="flex items-center gap-2">
                {key === "githubUrl" || key === "liveUrl" ? (
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {label}:
                </span>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm text-primary underline hover:no-underline"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Only the team owner can submit or update. Ask your team owner to open
          this page to make changes.
        </p>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Link2, Loader2, CheckCircle2, ExternalLink, FileText } from "lucide-react";
import { getEffectiveSubmissionTypes } from "@/lib/submission-types";
import { getPayloadKeyForSlug, type SubmissionPayload } from "@/lib/submission-payload";
import { SUBMISSION_TYPE_LABELS } from "@/lib/submission-types";
import type { SubmissionTypeSlug } from "@/db/schema";
import { isFileSubmissionType, isUrlOnlySubmissionType } from "@/lib/submission-types";

type SubmissionTypeConfig = Record<string, { label?: string; description?: string }> | null;

interface ChallengeSubmissionFormProps {
  challengeId: number;
  teamId: number;
  submissionTypes: string[] | null;
  submissionTypeConfig?: SubmissionTypeConfig;
}

function getLabel(slug: string, config: SubmissionTypeConfig): string {
  return config?.[slug]?.label?.trim() || SUBMISSION_TYPE_LABELS[slug as keyof typeof SUBMISSION_TYPE_LABELS] || slug;
}

function getDescription(slug: string, config: SubmissionTypeConfig): string | null {
  return config?.[slug]?.description?.trim() || null;
}

export function ChallengeSubmissionForm({
  challengeId,
  teamId,
  submissionTypes,
  submissionTypeConfig = null,
}: ChallengeSubmissionFormProps) {
  const router = useRouter();
  const types = getEffectiveSubmissionTypes(submissionTypes);
  const [payload, setPayload] = useState<SubmissionPayload>({});
  const [files, setFiles] = useState<Partial<Record<SubmissionTypeSlug, File>>>({});
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** When set, submission is final — show success view and no editing. */
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/challenges/${challengeId}/submissions?teamId=${teamId}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data.submission?.payload && typeof data.submission.payload === "object") {
          setPayload(data.submission.payload as SubmissionPayload);
          if (data.submission.submittedAt) {
            setSubmittedAt(data.submission.submittedAt);
          }
        }
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [challengeId, teamId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (types.length === 0) return;
    setError(null);

    const finalPayload: SubmissionPayload = { ...payload };

    for (const slug of types) {
      const key = getPayloadKeyForSlug(slug);
      if (!key) continue;
      if (isFileSubmissionType(slug)) {
        const file = files[slug as SubmissionTypeSlug];
        const existing = finalPayload[key];
        if (!file && !existing) {
          setError(`${getLabel(slug, submissionTypeConfig)} is required.`);
          return;
        }
      } else if (isUrlOnlySubmissionType(slug)) {
        if (!finalPayload[key]?.trim()) {
          setError(`${getLabel(slug, submissionTypeConfig)} is required.`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      for (const slug of types) {
        if (isFileSubmissionType(slug)) {
          const file = files[slug as SubmissionTypeSlug];
          if (file) {
            const formData = new FormData();
            formData.set("teamId", String(teamId));
            formData.set("type", slug);
            formData.set("file", file);
            const uploadRes = await fetch(`/api/challenges/${challengeId}/submissions/upload`, {
              method: "POST",
              body: formData,
            });
            const uploadData = await uploadRes.json().catch(() => ({}));
            if (!uploadRes.ok) {
              setError(uploadData.error ?? "Upload failed.");
              setLoading(false);
              return;
            }
            const key = getPayloadKeyForSlug(slug);
            if (key) finalPayload[key] = uploadData.url;
          }
        }
      }

      const res = await fetch(`/api/challenges/${challengeId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, payload: finalPayload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to submit.");
        setLoading(false);
        return;
      }
      setSubmittedAt(new Date().toISOString());
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const keyToLabel: Record<string, string> = {
    pitchDeckUrl: SUBMISSION_TYPE_LABELS.pitch_deck,
    wordDocUrl: SUBMISSION_TYPE_LABELS.word_doc,
    videoUrl: SUBMISSION_TYPE_LABELS.video,
    githubUrl: SUBMISSION_TYPE_LABELS.url_github,
    liveUrl: SUBMISSION_TYPE_LABELS.url_live,
  };

  if (types.length === 0) return null;
  if (loadingExisting) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  if (submittedAt) {
    const keys = ["pitchDeckUrl", "wordDocUrl", "videoUrl", "githubUrl", "liveUrl"] as const;
    const entries = keys
      .filter((k) => payload[k]?.trim())
      .map((k) => ({
        key: k,
        label: keyToLabel[k] ?? k,
        url: payload[k]!.trim(),
      }));
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
            Submission received
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Submitted{" "}
            {new Date(submittedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            . Your submission is final and cannot be edited.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            {entries.map(({ key, label, url }) => (
              <li key={key} className="flex items-center gap-2">
                {key === "githubUrl" || key === "liveUrl" ? (
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">{label}:</span>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submit your work</CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload files and/or add links as required by this challenge.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {types.map((slug) => {
            const key = getPayloadKeyForSlug(slug);
            if (!key) return null;
            const label = getLabel(slug, submissionTypeConfig);
            const description = getDescription(slug, submissionTypeConfig);

            if (isFileSubmissionType(slug)) {
              return (
                <div key={slug}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {label}
                  </label>
                  {description && <p className="mb-1.5 text-xs text-muted-foreground">{description}</p>}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept={slug === "pitch_deck" ? ".pdf,.ppt,.pptx" : slug === "word_doc" ? ".doc,.docx" : "video/*"}
                      className="block w-full max-w-sm text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFiles((prev) => ({ ...prev, [slug]: f }));
                        if (f && key) setPayload((prev) => ({ ...prev, [key]: "" }));
                      }}
                    />
                    {payload[key] && (
                      <span className="text-xs text-muted-foreground">Uploaded</span>
                    )}
                  </div>
                </div>
              );
            }

            if (isUrlOnlySubmissionType(slug)) {
              return (
                <div key={slug}>
                  <label htmlFor={slug} className="mb-1.5 block text-sm font-medium text-foreground">
                    {label}
                  </label>
                  {description && <p className="mb-1.5 text-xs text-muted-foreground">{description}</p>}
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 shrink-0 text-muted-foreground" />
                    <input
                      id={slug}
                      type="url"
                      placeholder={slug === "url_github" ? "https://github.com/..." : "https://..."}
                      value={payload[key] ?? ""}
                      onChange={(e) => setPayload((prev) => ({ ...prev, [key]: e.target.value.trim() }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Submit
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

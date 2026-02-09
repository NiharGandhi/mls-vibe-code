"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChallengeJudge } from "@/lib/challenge-judges";
import type { RubricCriterion } from "@/lib/rubric";
import {
  SubmissionFormBuilder,
  submissionFormBuilderValueFromChallenge,
  submissionFormBuilderValueToPayload,
  type SubmissionFormBuilderValue,
} from "../../_components/SubmissionFormBuilder";
import { dubaiInputToUTC } from "@/lib/datetime-dubai";

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  rules: string | null;
  evaluationCriteria: string | null;
  status: string;
  minTeamSize: number | null;
  maxTeamSize: number | null;
  maxTeams: number | null;
  startAt: string | null;
  endAt: string | null;
  submissionDeadline: string | null;
  submissionTypes: string[];
  submissionTypeConfig?: Record<string, { label?: string; description?: string }>;
  scoresReleasedAt?: string | null;
}

export function EditChallengeForm({
  challenge,
  judges = [],
  rubricCriteria = [],
}: {
  challenge: ChallengeData;
  judges?: ChallengeJudge[];
  rubricCriteria?: RubricCriterion[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [judgeEmail, setJudgeEmail] = useState("");
  const [addingJudge, setAddingJudge] = useState(false);
  const [newCriterionLabel, setNewCriterionLabel] = useState("");
  const [newCriterionMaxPoints, setNewCriterionMaxPoints] = useState(10);
  const [addingCriterion, setAddingCriterion] = useState(false);
  const [localRubric, setLocalRubric] = useState(rubricCriteria);
  const [localJudges, setLocalJudges] = useState(judges);
  const [submissionFormValue, setSubmissionFormValue] =
    useState<SubmissionFormBuilderValue>(() =>
      submissionFormBuilderValueFromChallenge(
        challenge.submissionTypes ?? [],
        challenge.submissionTypeConfig
      )
    );
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLocalJudges(judges);
  }, [judges]);
  useEffect(() => {
    setLocalRubric(rubricCriteria);
  }, [rubricCriteria]);
  useEffect(() => {
    setSubmissionFormValue(
      submissionFormBuilderValueFromChallenge(
        challenge.submissionTypes ?? [],
        challenge.submissionTypeConfig
      )
    );
  }, [challenge.submissionTypes, challenge.submissionTypeConfig]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { submissionTypes, submissionTypeConfig } =
      submissionFormBuilderValueToPayload(submissionFormValue);

    const body = {
      title: (formData.get("title") as string)?.trim(),
      description: (formData.get("description") as string)?.trim(),
      rules: (formData.get("rules") as string)?.trim() || null,
      evaluationCriteria: (formData.get("evaluationCriteria") as string)?.trim() || null,
      status: (formData.get("status") as string) || "upcoming",
      minTeamSize: parseInt((formData.get("minTeamSize") as string) || "1", 10) || 1,
      maxTeamSize: parseInt((formData.get("maxTeamSize") as string) || "5", 10) || null,
      maxTeams: (formData.get("maxTeams") as string)?.trim()
        ? parseInt(formData.get("maxTeams") as string, 10)
        : null,
      startAt: dubaiInputToUTC((formData.get("startAt") as string) || null)?.toISOString() ?? null,
      endAt: dubaiInputToUTC((formData.get("endAt") as string) || null)?.toISOString() ?? null,
      submissionDeadline: dubaiInputToUTC((formData.get("submissionDeadline") as string) || null)?.toISOString() ?? null,
      submissionTypes,
      submissionTypeConfig,
    };

    if (!body.title || !body.description) {
      setError("Title and description are required.");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/admin/challenges/${challenge.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to update challenge.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength={200}
                defaultValue={challenge.title}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
                Description
              </label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Markdown supported: **bold**, *italic*, # headers, - lists, [links](url), `code`
              </p>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                defaultValue={challenge.description}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="rules" className="mb-1.5 block text-sm font-medium text-foreground">
                Rules (optional)
              </label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Markdown supported
              </p>
              <textarea
                id="rules"
                name="rules"
                rows={3}
                defaultValue={challenge.rules ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
              />
            </div>
            <div>
              <label htmlFor="evaluationCriteria" className="mb-1.5 block text-sm font-medium text-foreground">
                Evaluation criteria (optional)
              </label>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Markdown supported
              </p>
              <textarea
                id="evaluationCriteria"
                name="evaluationCriteria"
                rows={3}
                defaultValue={challenge.evaluationCriteria ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission form</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add and order the fields participants must fill when submitting. Customize labels and help text per field.
            </p>
          </CardHeader>
          <CardContent>
            <SubmissionFormBuilder
              value={submissionFormValue}
              onChange={setSubmissionFormValue}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Judges</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add users as judges for this challenge. Judges can score submissions using the rubric.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {localJudges.length > 0 && (
              <ul className="space-y-1 text-sm">
                {localJudges.map((j) => (
                  <li key={j.id} className="flex items-center justify-between gap-2">
                    <span>
                      {j.name ?? j.email ?? j.userId}
                      {j.email && j.name && (
                        <span className="text-muted-foreground"> ({j.email})</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/admin/challenges/${challenge.id}/judges?userId=${encodeURIComponent(j.userId)}`,
                          { method: "DELETE" }
                        );
                        if (res.ok) {
                          setLocalJudges((prev) => prev.filter((x) => x.userId !== j.userId));
                          router.refresh();
                        }
                      }}
                      className="text-destructive hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                value={judgeEmail}
                onChange={(e) => setJudgeEmail(e.target.value)}
                placeholder="Judge email"
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={addingJudge || !judgeEmail.trim()}
                onClick={async () => {
                  setAddingJudge(true);
                  try {
                    const res = await fetch(`/api/admin/challenges/${challenge.id}/judges`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: judgeEmail.trim() }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) {
                      setJudgeEmail("");
                      router.refresh();
                    } else {
                      setError(data.error ?? "Failed to add judge");
                    }
                  } finally {
                    setAddingJudge(false);
                  }
                }}
              >
                {addingJudge ? "Adding…" : "Add judge"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rubric</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define criteria judges will use to score submissions. Each criterion has a label and max points.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {localRubric.length > 0 && (
              <ul className="space-y-2 text-sm">
                {localRubric.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded border border-border/50 px-3 py-2"
                  >
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground">0–{c.maxPoints} pts</span>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await fetch(
                          `/api/admin/challenges/${challenge.id}/rubric/${c.id}`,
                          { method: "DELETE" }
                        );
                        if (res.ok) {
                          setLocalRubric((prev) => prev.filter((x) => x.id !== c.id));
                          router.refresh();
                        }
                      }}
                      className="text-destructive hover:underline text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Label
                </label>
                <input
                  type="text"
                  value={newCriterionLabel}
                  onChange={(e) => setNewCriterionLabel(e.target.value)}
                  placeholder="e.g. Technical quality"
                  className="w-48 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Max points
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newCriterionMaxPoints}
                  onChange={(e) =>
                    setNewCriterionMaxPoints(parseInt(e.target.value, 10) || 10)
                  }
                  className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={addingCriterion || !newCriterionLabel.trim()}
                onClick={async () => {
                  setAddingCriterion(true);
                  try {
                    const res = await fetch(`/api/admin/challenges/${challenge.id}/rubric`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        label: newCriterionLabel.trim(),
                        maxPoints: newCriterionMaxPoints,
                      }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok && data.id) {
                      setNewCriterionLabel("");
                      setNewCriterionMaxPoints(10);
                      router.refresh();
                    } else {
                      setError(data.error ?? "Failed to add criterion");
                    }
                  } finally {
                    setAddingCriterion(false);
                  }
                }}
              >
                {addingCriterion ? "Adding…" : "Add criterion"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Release scores</CardTitle>
            <p className="text-sm text-muted-foreground">
              When you release scores, participants can see rubric scores and tabulated results for all submissions in this challenge.
            </p>
          </CardHeader>
          <CardContent>
            {challenge.scoresReleasedAt ? (
              <p className="text-sm text-muted-foreground">
                Scores released on{" "}
                {new Date(challenge.scoresReleasedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : (
              <Button
                type="button"
                variant="default"
                onClick={async () => {
                  const res = await fetch(
                    `/api/admin/challenges/${challenge.id}/release-scores`,
                    { method: "POST" }
                  );
                  if (res.ok) router.refresh();
                }}
              >
                Release all scores
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Schedule & team size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={challenge.status}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="upcoming">Upcoming</option>
                <option value="running">Running</option>
                <option value="finished">Finished</option>
              </select>
            </div>
            <div>
              <label htmlFor="maxTeams" className="mb-1.5 block text-sm font-medium text-foreground">
                Max teams (optional)
              </label>
              <input
                id="maxTeams"
                name="maxTeams"
                type="number"
                min={1}
                placeholder="No limit"
                defaultValue={challenge.maxTeams ?? ""}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Cap on how many teams can join. Leave empty for no limit.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minTeamSize" className="mb-1.5 block text-sm font-medium text-foreground">
                  Min team size
                </label>
                <input
                  id="minTeamSize"
                  name="minTeamSize"
                  type="number"
                  min={1}
                  defaultValue={challenge.minTeamSize ?? 1}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="maxTeamSize" className="mb-1.5 block text-sm font-medium text-foreground">
                  Max team size
                </label>
                <input
                  id="maxTeamSize"
                  name="maxTeamSize"
                  type="number"
                  min={1}
                  defaultValue={challenge.maxTeamSize ?? 5}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="startAt" className="mb-1.5 block text-sm font-medium text-foreground">
                  Start date (Dubai)
                </label>
                <input
                  id="startAt"
                  name="startAt"
                  type="datetime-local"
                  defaultValue={challenge.startAt ?? ""}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="endAt" className="mb-1.5 block text-sm font-medium text-foreground">
                  End date (Dubai)
                </label>
                <input
                  id="endAt"
                  name="endAt"
                  type="datetime-local"
                  defaultValue={challenge.endAt ?? ""}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div>
                <label htmlFor="submissionDeadline" className="mb-1.5 block text-sm font-medium text-foreground">
                  Submission deadline (Dubai)
                </label>
                <input
                  id="submissionDeadline"
                  name="submissionDeadline"
                  type="datetime-local"
                  defaultValue={challenge.submissionDeadline ?? ""}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/challenges")}
          >
            Back to challenges
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            disabled={loading || deleting}
            onClick={async () => {
              if (
                !confirm(
                  "Are you sure you want to delete this challenge? All submissions, judges, and rubric data will be removed. This cannot be undone."
                )
              )
                return;
              setDeleting(true);
              try {
                const res = await fetch(`/api/admin/challenges/${challenge.id}`, {
                  method: "DELETE",
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setError(data.error ?? "Failed to delete challenge.");
                  return;
                }
                router.push("/admin/challenges");
                router.refresh();
              } finally {
                setDeleting(false);
              }
            }}
          >
            {deleting ? "Deleting…" : "Delete challenge"}
          </Button>
        </div>
      </div>
    </form>
  );
}

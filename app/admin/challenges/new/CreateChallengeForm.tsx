"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SubmissionFormBuilder,
  submissionFormBuilderValueFromChallenge,
  submissionFormBuilderValueToPayload,
  type SubmissionFormBuilderValue,
} from "../_components/SubmissionFormBuilder";
import { dubaiInputToUTC } from "@/lib/datetime-dubai";

export function CreateChallengeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionFormValue, setSubmissionFormValue] =
    useState<SubmissionFormBuilderValue>(() =>
      submissionFormBuilderValueFromChallenge(["all"], {})
    );

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

    const res = await fetch("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to create challenge.");
      return;
    }

    router.push(`/admin/challenges/${data.id}/edit`);
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                placeholder="Challenge title"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
                placeholder="Describe the challenge... (Markdown allowed)"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
                placeholder="Rules and guidelines"
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
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono"
                placeholder="How submissions will be judged"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission form</CardTitle>
            <p className="text-sm text-muted-foreground">
              Add and order the fields participants must fill when submitting (e.g. pitch deck, video, repo link). Customize labels and help text per field.
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
                  defaultValue={1}
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
                  defaultValue={5}
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
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create challenge"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

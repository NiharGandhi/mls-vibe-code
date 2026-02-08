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
import type { Challenge } from "@/lib/challenge";

interface SendNotificationFormProps {
  challenges: Challenge[];
}

export function SendNotificationForm({ challenges }: SendNotificationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mode, setMode] = useState<"all" | "challenge">("all");
  const [challengeId, setChallengeId] = useState<number | "">(
    challenges[0]?.id ?? ""
  );
  const [audience, setAudience] = useState<"all" | "participants">("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [urgency, setUrgency] = useState<"info" | "warning" | "critical">("info");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload =
      mode === "all"
        ? { mode: "all" as const, title: title.trim(), body: body.trim() || null, priority, urgency }
        : {
            mode: "challenge" as const,
            challengeId: Number(challengeId),
            audience,
            title: title.trim(),
            body: body.trim() || null,
            priority,
            urgency,
          };

    if (mode === "challenge" && (!challengeId || Number.isNaN(Number(challengeId)))) {
      setError("Select a challenge.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to send notifications.");
      return;
    }

    setSuccess(`Sent to ${data.count} user(s).`);
    setTitle("");
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Send to
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "all"}
                  onChange={() => setMode("all")}
                  className="rounded-full"
                />
                All users
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "challenge"}
                  onChange={() => setMode("challenge")}
                  className="rounded-full"
                />
                Regarding a challenge
              </label>
            </div>
          </div>

          {mode === "challenge" && (
            <>
              <div>
                <label htmlFor="challenge" className="mb-1.5 block text-sm font-medium text-foreground">
                  Challenge
                </label>
                <select
                  id="challenge"
                  value={challengeId}
                  onChange={(e) => setChallengeId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select challenge…</option>
                  {challenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Audience
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "all"}
                      onChange={() => setAudience("all")}
                      className="rounded-full"
                    />
                    All users
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === "participants"}
                      onChange={() => setAudience("participants")}
                      className="rounded-full"
                    />
                    Challenge participants only
                  </label>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-foreground">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div>
            <label htmlFor="body" className="mb-1.5 block text-sm font-medium text-foreground">
              Message (optional)
            </label>
            <textarea
              id="body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-foreground">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "normal" | "high")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="urgency" className="mb-1.5 block text-sm font-medium text-foreground">
                Urgency
              </label>
              <select
                id="urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as "info" | "warning" | "critical")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send notification"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

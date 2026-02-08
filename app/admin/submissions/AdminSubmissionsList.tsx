"use client";

import type { AdminSubmission } from "@/lib/admin-submissions";
import { Fragment } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminSubmissionsListProps {
  submissions: AdminSubmission[];
}

const statusConfig = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  needs_review: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
} as const;

export function AdminSubmissionsList({ submissions }: AdminSubmissionsListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    status: string;
    score: string;
    feedback: string;
  } | null>(null);

  function startEdit(s: AdminSubmission) {
    setEditingId(s.id);
    setFormData({
      status: s.status,
      score: s.score != null ? String(s.score) : "",
      feedback: s.feedback ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData(null);
  }

  async function saveEdit(id: number) {
    if (!formData) return;
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: formData.status,
          score: formData.score ? parseInt(formData.score, 10) : null,
          feedback: formData.feedback || null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setFormData(null);
        router.refresh();
      }
    } catch {
      // ignore
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-foreground">Challenge</th>
            <th className="px-4 py-3 font-medium text-foreground">Team</th>
            <th className="px-4 py-3 font-medium text-foreground">Submitted by</th>
            <th className="px-4 py-3 font-medium text-foreground">Status</th>
            <th className="px-4 py-3 font-medium text-foreground">Score</th>
            <th className="px-4 py-3 font-medium text-foreground">Date</th>
            <th className="px-4 py-3" />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <Fragment key={s.id}>
              <tr className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{s.challengeTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.teamName}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.submittedByName}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                      statusConfig[s.status as keyof typeof statusConfig] ??
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.score ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(s.submittedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/admin/submissions/${s.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </a>
                </td>
                <td className="px-4 py-3">
                  {editingId === s.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(s.id)}
                        className="text-primary hover:underline"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-muted-foreground hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(s)}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
              {editingId === s.id && formData && (
                <tr className="border-b border-border bg-muted/20">
                  <td colSpan={8} className="px-4 py-4">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData((p) => (p ? { ...p, status: e.target.value } : null))
                          }
                          className="rounded border border-input bg-background px-2 py-1.5 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="needs_review">Needs review</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Score
                        </label>
                        <input
                          type="number"
                          value={formData.score}
                          onChange={(e) =>
                            setFormData((p) => (p ? { ...p, score: e.target.value } : null))
                          }
                          className="w-24 rounded border border-input bg-background px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div className="min-w-[200px] flex-1">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          Feedback
                        </label>
                        <input
                          type="text"
                          value={formData.feedback}
                          onChange={(e) =>
                            setFormData((p) => (p ? { ...p, feedback: e.target.value } : null))
                          }
                          placeholder="Feedback for the team"
                          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

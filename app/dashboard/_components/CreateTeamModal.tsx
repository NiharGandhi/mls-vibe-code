"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClassName =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60";

const DEBOUNCE_MS = 400;

type NameCheckStatus = "idle" | "checking" | "available" | "taken";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}

export function CreateTeamModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
}: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("");
  const [nameCheckStatus, setNameCheckStatus] = useState<NameCheckStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const checkName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameCheckStatus("idle");
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setNameCheckStatus("checking");
    try {
      const res = await fetch(
        `/api/team/check-name?name=${encodeURIComponent(trimmed)}`,
        { signal: abortRef.current.signal }
      );
      const data = (await res.json()) as { available?: boolean };
      if (data.available === true) {
        setNameCheckStatus("available");
      } else {
        setNameCheckStatus("taken");
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setNameCheckStatus("idle");
    } finally {
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setTeamName("");
      setNameCheckStatus("idle");
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      abortRef.current?.abort();
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!teamName.trim()) {
      setNameCheckStatus("idle");
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      checkName(teamName);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [teamName, open, checkName]);

  const isSubmitDisabled =
    loading ||
    nameCheckStatus === "checking" ||
    nameCheckStatus === "taken" ||
    !teamName.trim();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-team-title"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle id="create-team-title" className="text-lg">
            Create a team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="create-team-name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Team name
              </label>
              <input
                id="create-team-name"
                name="name"
                type="text"
                required
                maxLength={150}
                disabled={loading}
                placeholder="e.g. Hackathon Squad"
                className={cn(inputClassName)}
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                aria-describedby="name-check-message"
                aria-invalid={nameCheckStatus === "taken"}
              />
              <div
                id="name-check-message"
                className="flex items-center gap-2 text-sm"
                role="status"
                aria-live="polite"
              >
                {nameCheckStatus === "checking" && (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Checking availability…</span>
                  </>
                )}
                {nameCheckStatus === "available" && (
                  <>
                    <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-500" />
                    <span className="text-green-600 dark:text-green-500">Name available</span>
                  </>
                )}
                {nameCheckStatus === "taken" && (
                  <>
                    <XCircle className="size-4 shrink-0 text-destructive" />
                    <span className="text-destructive">Name already taken</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="create-team-desc"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description (optional)
              </label>
              <textarea
                id="create-team-desc"
                name="description"
                rows={2}
                disabled={loading}
                placeholder="What's this team about?"
                className={cn(inputClassName, "resize-none")}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitDisabled}
              >
                {loading ? "Creating…" : "Create team"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

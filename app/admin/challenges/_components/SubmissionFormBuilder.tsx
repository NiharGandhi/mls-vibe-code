"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBMISSION_TYPE_LABELS } from "@/lib/submission-types";
import { SUBMISSION_TYPE_SLUGS, type SubmissionTypeSlug } from "@/db/schema";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
  FileText,
  Video,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SubmissionTypeConfig = Record<
  string,
  { label?: string; description?: string }
>;

export interface SubmissionFormBuilderValue {
  submissionTypes: string[];
  submissionTypeConfig: SubmissionTypeConfig;
}

const SLUG_ICONS: Record<SubmissionTypeSlug, React.ReactNode> = {
  pitch_deck: <FileText className="size-4 shrink-0" />,
  word_doc: <FileText className="size-4 shrink-0" />,
  video: <Video className="size-4 shrink-0" />,
  url_github: <Link2 className="size-4 shrink-0" />,
  url_live: <Link2 className="size-4 shrink-0" />,
};

function getDefaultLabel(slug: string): string {
  return SUBMISSION_TYPE_LABELS[slug as keyof typeof SUBMISSION_TYPE_LABELS] ?? slug;
}

interface SubmissionFormBuilderProps {
  value: SubmissionFormBuilderValue;
  onChange: (value: SubmissionFormBuilderValue) => void;
  disabled?: boolean;
  /** Optional: hide the "Add field" when max fields reached (default: show all 5) */
  maxFields?: number;
}

export function SubmissionFormBuilder({
  value,
  onChange,
  disabled = false,
  maxFields = SUBMISSION_TYPE_SLUGS.length,
}: SubmissionFormBuilderProps) {
  const { submissionTypes, submissionTypeConfig } = value;
  const orderedSlugs = submissionTypes.filter((s) =>
    SUBMISSION_TYPE_SLUGS.includes(s as SubmissionTypeSlug)
  ) as SubmissionTypeSlug[];
  const availableToAdd = SUBMISSION_TYPE_SLUGS.filter(
    (s) => !orderedSlugs.includes(s)
  );
  const [addOpen, setAddOpen] = useState(false);

  const updateTypes = (next: SubmissionTypeSlug[]) => {
    onChange({ ...value, submissionTypes: next });
  };

  const updateConfig = (
    slug: string,
    patch: { label?: string; description?: string }
  ) => {
    const next = { ...submissionTypeConfig };
    next[slug] = { ...next[slug], ...patch };
    if (!next[slug]?.label && !next[slug]?.description) delete next[slug];
    onChange({ ...value, submissionTypeConfig: next });
  };

  const addField = (slug: SubmissionTypeSlug) => {
    if (orderedSlugs.includes(slug)) return;
    updateTypes([...orderedSlugs, slug]);
    setAddOpen(false);
  };

  const removeField = (index: number) => {
    const next = orderedSlugs.filter((_, i) => i !== index);
    updateTypes(next);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...orderedSlugs];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    updateTypes(next);
  };

  const moveDown = (index: number) => {
    if (index >= orderedSlugs.length - 1) return;
    const next = [...orderedSlugs];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    updateTypes(next);
  };

  const effectiveSlugs = orderedSlugs;

  const canAdd =
    availableToAdd.length > 0 &&
    effectiveSlugs.length < maxFields &&
    !disabled;

  return (
    <div className="space-y-4">
      {effectiveSlugs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-10 text-center">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            No submission fields yet
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            Add the fields participants must fill when submitting (e.g. pitch deck, video, repo link).
          </p>
          {canAdd && (
            <Select
              key="add-first"
              open={addOpen}
              onOpenChange={setAddOpen}
              onValueChange={(v) => v && addField(v as SubmissionTypeSlug)}
            >
              <SelectTrigger className="w-auto min-w-[200px]">
                <Plus className="size-4 mr-2" />
                <SelectValue placeholder="Add first field…" />
              </SelectTrigger>
              <SelectContent>
                {SUBMISSION_TYPE_SLUGS.map((slug) => (
                  <SelectItem key={slug} value={slug}>
                    <span className="flex items-center gap-2">
                      {SLUG_ICONS[slug]}
                      {getDefaultLabel(slug)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {effectiveSlugs.map((slug, index) => (
            <li
              key={`${slug}-${index}`}
              className={cn(
                "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-shadow",
                !disabled && "hover:shadow-sm"
              )}
            >
              <div className="flex items-start gap-2">
                <div className="flex shrink-0 items-center gap-0.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => moveUp(index)}
                    disabled={disabled || index === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-foreground"
                    onClick={() => moveDown(index)}
                    disabled={disabled || index === effectiveSlugs.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <span className="text-muted-foreground/60" aria-hidden>
                    <GripVertical className="size-4" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {SLUG_ICONS[slug]}
                      {getDefaultLabel(slug)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Field {index + 1}
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`builder-${slug}-${index}-label`}
                        className="text-xs"
                      >
                        Custom label (optional)
                      </Label>
                      <Input
                        id={`builder-${slug}-${index}-label`}
                        placeholder={getDefaultLabel(slug)}
                        value={submissionTypeConfig[slug]?.label ?? ""}
                        onChange={(e) =>
                          updateConfig(slug, { label: e.target.value.trim() || undefined })
                        }
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`builder-${slug}-${index}-desc`}
                        className="text-xs"
                      >
                        Help text (optional)
                      </Label>
                      <Input
                        id={`builder-${slug}-${index}-desc`}
                        placeholder="e.g. Max 10MB, PDF only"
                        value={submissionTypeConfig[slug]?.description ?? ""}
                        onChange={(e) =>
                          updateConfig(slug, {
                            description: e.target.value.trim() || undefined,
                          })
                        }
                        disabled={disabled}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeField(index)}
                  disabled={disabled}
                  aria-label="Remove field"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {effectiveSlugs.length > 0 && canAdd && (
        <Select
          key={`add-${effectiveSlugs.length}`}
          open={addOpen}
          onOpenChange={setAddOpen}
          onValueChange={(v) => v && addField(v as SubmissionTypeSlug)}
        >
          <SelectTrigger className="w-auto border-dashed">
            <Plus className="size-4 mr-2" />
            <SelectValue placeholder="Add another field…" />
          </SelectTrigger>
          <SelectContent>
            {availableToAdd.map((slug) => (
              <SelectItem key={slug} value={slug}>
                <span className="flex items-center gap-2">
                  {SLUG_ICONS[slug]}
                  {getDefaultLabel(slug)}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {effectiveSlugs.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Participants will see these fields in order on the challenge submission page. Use custom labels and help text to clarify requirements.
        </p>
      )}
    </div>
  );
}

/** Convert API value (submissionTypes may include "all") to builder value with explicit list. */
export function submissionFormBuilderValueFromChallenge(
  submissionTypes: string[],
  submissionTypeConfig?: SubmissionTypeConfig | null
): SubmissionFormBuilderValue {
  const expanded =
    !submissionTypes?.length || submissionTypes.includes("all")
      ? [...SUBMISSION_TYPE_SLUGS]
      : submissionTypes.filter((s) =>
          SUBMISSION_TYPE_SLUGS.includes(s as SubmissionTypeSlug)
        );
  return {
    submissionTypes: expanded,
    submissionTypeConfig: submissionTypeConfig && typeof submissionTypeConfig === "object"
      ? { ...submissionTypeConfig }
      : {},
  };
}

/** Convert builder value back to API payload (submissionTypes array, or ["all"] if all five). */
export function submissionFormBuilderValueToPayload(
  value: SubmissionFormBuilderValue
): {
  submissionTypes: string[];
  submissionTypeConfig: SubmissionTypeConfig;
} {
  const list = value.submissionTypes.filter((s) =>
    SUBMISSION_TYPE_SLUGS.includes(s as SubmissionTypeSlug)
  );
  const submissionTypes =
    list.length === SUBMISSION_TYPE_SLUGS.length ? ["all"] : list;
  return {
    submissionTypes,
    submissionTypeConfig: value.submissionTypeConfig ?? {},
  };
}

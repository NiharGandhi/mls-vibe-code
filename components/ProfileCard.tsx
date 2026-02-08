import { cn } from "@/lib/utils";

export interface ProfileCardProps {
  name: string;
  email: string;
  yearOfStudy?: string | null;
  majorOfStudy?: string | null;
  role?: string;
  className?: string;
  /** Optional actions rendered inside the card (e.g. Remove / Promote). */
  actions?: React.ReactNode;
  /** Flat style - for use inside lists, no card chrome */
  compact?: boolean;
}

export function ProfileCard({
  name,
  email,
  yearOfStudy,
  majorOfStudy,
  role,
  className,
  actions,
  compact = false,
}: ProfileCardProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const metaLabel = [
    yearOfStudy ? `${yearOfStudy} Year` : null,
    majorOfStudy ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <>
      <div className="flex items-center gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
          aria-label={`Avatar for ${name}`}
        >
          {initials || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            {role != null && role !== "" && (
              <span className="text-xs text-muted-foreground capitalize">
                {role}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          {metaLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">{metaLabel}</p>
          )}
        </div>
      </div>
      {actions != null && (
        <div className="mt-2 flex items-center justify-end gap-1">
          {actions}
        </div>
      )}
    </>
  );

  if (compact) {
    return <div className={cn("min-w-0", className)}>{content}</div>;
  }

  return (
    <div
      className={cn(
        "rounded border border-border bg-background p-3",
        className
      )}
    >
      {content}
    </div>
  );
}

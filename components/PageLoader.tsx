import { cn } from "@/lib/utils";

/** Centered spinner for route loading states. */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] items-center justify-center p-8",
        className
      )}
      aria-label="Loading"
    >
      <div
        className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
        role="presentation"
      />
    </div>
  );
}

/** Skeleton bar for list/detail loading. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      role="presentation"
    />
  );
}

/** Full-page skeleton for list views (e.g. challenges, submissions). */
export function PageSkeleton({
  title = true,
  rows = 5,
  className,
}: {
  title?: boolean;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-4xl space-y-6 p-6", className)}>
      {title && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

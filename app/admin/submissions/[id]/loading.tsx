import { PageSkeleton } from "@/components/PageLoader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

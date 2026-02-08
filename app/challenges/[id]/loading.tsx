import { PageSkeleton } from "@/components/PageLoader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <PageSkeleton title={false} rows={0} className="p-0 space-y-0" />
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded bg-muted" />
        <div className="h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

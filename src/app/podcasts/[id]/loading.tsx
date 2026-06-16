import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastDetailLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pb-32 pt-4 lg:pt-6">
      <Skeleton className="mb-4 h-5 w-24" />
      <Skeleton className="mb-3 h-5 w-40" />
      <div className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-elev-1">
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
          <Skeleton className="size-[200px] max-w-full rounded-[var(--radius)] lg:size-[140px]" />
          <div className="w-full flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="mt-5 h-[6px] w-full rounded-full" />
        <div className="mt-5 flex justify-center gap-6">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="size-11 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-4 h-16 w-full rounded-[var(--radius)]" />
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-[var(--radius)]" />
        <Skeleton className="h-16 rounded-[var(--radius)]" />
      </div>
    </div>
  );
}

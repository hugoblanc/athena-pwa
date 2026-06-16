import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton iso-dimension de `ContentCard` (réutilisé par tous les feeds). */
export function ContentCardSkeleton() {
  return (
    <div className="flex gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5">
      <Skeleton className="size-[88px] shrink-0" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-auto h-3 w-24" />
      </div>
    </div>
  );
}

/** Liste de skeletons. */
export function ContentListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  );
}

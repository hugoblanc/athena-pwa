import { ContentCardSkeleton } from "@/components/content/content-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton iso-structure de la page détail média (anti-CLS). */
export default function MediaDetailLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <div className="mb-5 border-b border-border pb-5">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 shrink-0 rounded-[10px]" />
          <div className="flex flex-1 flex-col gap-2.5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="mt-4 h-9 w-40" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ContentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

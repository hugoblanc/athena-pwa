import { ContentListSkeleton } from "@/components/content/content-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton du fil pendant un changement de filtre/recherche côté client :
 * 1 bloc hero (16:9-ish) + une liste de cartes. Le 1er rendu (SSR) n'en a
 * pas besoin (la 1ère page est déjà rendue serveur).
 */
export function FeedSkeleton() {
  return (
    <div>
      {/* Hero */}
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-elev-1">
        <Skeleton className="h-[184px] w-full rounded-none" />
        <div className="flex flex-col gap-2.5 p-[18px]">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-1 h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </div>

      {/* Liste */}
      <div className="mt-[22px]">
        <ContentListSkeleton count={5} />
      </div>
    </div>
  );
}

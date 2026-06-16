import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton de la carte d'aperçu (navigation SPA interne uniquement). */
export default function ShareLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:px-8 lg:pt-8">
      <div className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-elev-1">
        <Skeleton className="aspect-video w-full rounded-none" />
        <div className="flex flex-col gap-3 p-[18px] lg:p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="mt-2 h-[42px] w-48" />
        </div>
      </div>
    </div>
  );
}

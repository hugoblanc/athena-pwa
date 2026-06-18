import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton de l'annuaire médias (transitions). */
export default function MediasLoading() {
  return (
    <div className="mx-auto max-w-5xl px-5 pt-4 lg:pt-6">
      <Skeleton className="mb-4 h-9 w-40" />
      <div className="flex flex-col gap-6 pb-8">
        {Array.from({ length: 2 }).map((_, s) => (
          <section key={s}>
            <Skeleton className="my-2.5 h-5 w-32" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5"
                >
                  <Skeleton className="size-12 shrink-0 rounded-[10px]" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

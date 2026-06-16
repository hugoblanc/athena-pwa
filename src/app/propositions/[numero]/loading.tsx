export default function Loading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 pb-10 lg:pt-6" aria-hidden>
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 animate-pulse rounded bg-surface-2" />
        <div className="size-[42px] animate-pulse rounded-[var(--radius)] bg-surface-2" />
      </div>
      <div className="mt-3.5 h-5 w-32 animate-pulse rounded bg-surface-2" />
      <div className="mt-3.5 space-y-2">
        <div className="h-7 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-surface-2" />
      </div>

      <div className="mt-5 flex items-center gap-2.5">
        <div className="size-11 animate-pulse rounded-full bg-surface-2" />
        <div className="space-y-1.5">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        </div>
      </div>

      <div className="mt-6 h-11 w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />

      <div className="mt-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-[var(--radius)] bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}

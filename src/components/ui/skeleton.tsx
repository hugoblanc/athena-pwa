import { cn } from "@/lib/cn";

/** Bloc de chargement générique. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-surface-2", className)}
      aria-hidden
    />
  );
}

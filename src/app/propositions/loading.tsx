import { LawProposalCardSkeleton } from "@/components/law/law-proposal-card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <div className="mb-4 space-y-2">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="mb-5 h-9 w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LawProposalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { PodcastListSkeleton } from "@/components/content/podcast-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastsLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pb-32 pt-4 lg:pt-6">
      <Skeleton className="mb-4 h-8 w-40" />
      <Skeleton className="mb-4 h-11 w-full rounded-[var(--radius)]" />
      <PodcastListSkeleton count={6} />
    </div>
  );
}

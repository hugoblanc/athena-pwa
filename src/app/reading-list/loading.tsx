import { ContentListSkeleton } from "@/components/content/content-card-skeleton";

export default function ReadingListLoading() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 pb-16 lg:pt-6">
      <div className="mb-5 h-8 w-48 animate-pulse rounded bg-surface-2" />
      <ContentListSkeleton count={4} />
    </div>
  );
}

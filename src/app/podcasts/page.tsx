import { PodcastList } from "@/components/podcast/podcast-list";
import { listPodcasts } from "@/lib/api/podcast";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { Podcast } from "@/lib/api/types";

export const metadata = {
  title: "Podcasts — Athena",
  description: "Les podcasts générés par Athena à partir des médias libres.",
};

const EMPTY_PAGE: UnifiedPage<Podcast> = {
  items: [],
  page: 1,
  hasNext: false,
  total: 0,
};

/** `/podcasts` — liste paginée + recherche. 1ʳᵉ page rendue côté serveur. */
export default async function PodcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const terms = q?.trim() ?? "";

  let initialPage = EMPTY_PAGE;
  try {
    initialPage = await listPodcasts({ page: 1, size: 10, terms });
  } catch {
    // L'orchestrateur client affichera l'état d'erreur + « Réessayer ».
  }

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-32 pt-4 lg:pt-6">
      <h1 className="mb-3 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        Podcasts
      </h1>
      <PodcastList initialPage={initialPage} initialTerms={terms} />
    </div>
  );
}

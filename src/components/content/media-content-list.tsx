"use client";

import { Inbox } from "lucide-react";
import { useCallback, useState } from "react";
import { ContentCard } from "@/components/content/content-card";
import { ContentCardSkeleton } from "@/components/content/content-card-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { Content, MetaMediaType } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";

function toCardData(c: Content, mediaTitle: string) {
  const isVideo = c.contentType === "YOUTUBE";
  const typeLabel = (t: MetaMediaType) => (t === "YOUTUBE" ? "Vidéo" : "Article");
  return {
    href: `/content/${c.metaMedia.key}/${c.contentId}`,
    tag: `${typeLabel(c.contentType)} · ${mediaTitle}`,
    title: c.title,
    meta: formatRelative(c.publishedAt),
    image: c.image?.url,
    isVideo,
  };
}

/**
 * Liste des contenus d'un média avec infinite scroll.
 * Reçoit la 1re page rendue côté serveur (SSR) puis charge la suite via
 * Server Action. Conserve les items déjà chargés en cas d'erreur réseau.
 */
export function MediaContentList({
  initialPage,
  mediaKey,
  mediaTitle,
  mediaUrl,
  loadMore,
}: {
  initialPage: UnifiedPage<Content>;
  mediaKey: string;
  mediaTitle: string;
  mediaUrl?: string;
  loadMore: (key: string, page: number) => Promise<UnifiedPage<Content>>;
}) {
  const [items, setItems] = useState<Content[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasNext) return;
    setLoading(true);
    setError(false);
    try {
      const next = await loadMore(mediaKey, page + 1);
      setItems((prev) => [...prev, ...next.items]);
      setPage(next.page);
      setHasNext(next.hasNext);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasNext, loadMore, mediaKey, page]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucun contenu pour le moment"
        description="Ce média n'a pas encore de contenu agrégé."
        action={
          mediaUrl ? (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text hover:border-text-faint"
            >
              Voir le site du média
            </a>
          ) : undefined
        }
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        {items.map((c) => (
          <ContentCard
            key={`${c.contentId}-${c.id}`}
            data={toCardData(c, mediaTitle)}
          />
        ))}
      </div>

      {loading && (
        <div
          className="mt-3 flex flex-col gap-3"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Chargement de contenus supplémentaires</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <ContentCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-[var(--radius)] border border-danger/35 bg-danger/10 p-4 text-center text-sm text-text-dim">
          <span>Impossible de charger la suite.</span>
          <Button variant="danger" size="sm" onClick={handleLoadMore}>
            Réessayer
          </Button>
        </div>
      )}

      {!error && (
        <InfiniteSentinel
          onLoadMore={handleLoadMore}
          hasNext={hasNext}
          loading={loading}
        />
      )}

      {!hasNext && !loading && (
        <p
          className="py-6 text-center text-xs text-text-faint"
          aria-live="polite"
        >
          Tous les contenus sont affichés.
        </p>
      )}
    </div>
  );
}

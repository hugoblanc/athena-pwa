"use client";

import { SearchX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContentCard, HeroCard } from "@/components/content/content-card";
import { ContentListSkeleton } from "@/components/content/content-card-skeleton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { SearchField } from "@/components/ui/search-field";
import { getLastContent } from "@/lib/api/content";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { ContentLite, ListMetaMedia } from "@/lib/api/types";
import {
  FEED_TYPE_CHIPS,
  type FeedType,
  mediaKeysForType,
  toCardData,
  toHeroData,
} from "./feed-utils";
import { FeedSkeleton } from "./feed-skeleton";

const PAGE_SIZE = 10;

export function FeedClient({
  initialPage,
  medias,
  initialTerms,
  initialType,
}: {
  initialPage: UnifiedPage<ContentLite>;
  medias: ListMetaMedia[];
  initialTerms: string;
  initialType: FeedType;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [items, setItems] = useState<ContentLite[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);

  const [terms, setTerms] = useState(initialTerms);
  const [type, setType] = useState<FeedType>(initialType);

  const [loadingMore, setLoadingMore] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<"page" | "more" | null>(null);
  // Incrémenté pour re-déclencher le fetch page 1 (réessai sur erreur).
  const [retryKey, setRetryKey] = useState(0);

  // Évite que le re-fetch initial (déclenché par l'effet) écrase la 1ère page SSR.
  const firstRender = useRef(true);

  const fetchPage = useCallback(
    async (targetPage: number, t: string, ty: FeedType) => {
      return getLastContent({
        page: targetPage,
        size: PAGE_SIZE,
        terms: t || undefined,
        mediaKeys: mediaKeysForType(ty, medias),
      });
    },
    [medias],
  );

  // Re-fetch page 1 quand terms/type changent (hors 1er rendu = page SSR).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    let cancelled = false;
    setRefetching(true);
    setError(null);
    fetchPage(1, terms, type)
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setPage(res.page);
        setHasNext(res.hasNext);
      })
      .catch(() => {
        if (!cancelled) setError("page");
      })
      .finally(() => {
        if (!cancelled) setRefetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [terms, type, retryKey, fetchPage]);

  // Synchronise l'URL (partage / retour navigateur) sans recharger la page.
  useEffect(() => {
    const params = new URLSearchParams();
    if (terms) params.set("q", terms);
    if (type !== "all") params.set("type", type);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [terms, type, pathname, router]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasNext) return;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetchPage(page + 1, terms, type);
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setHasNext(res.hasNext);
    } catch {
      setError("more");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNext, fetchPage, page, terms, type]);

  function resetFilters() {
    setTerms("");
    setType("all");
  }

  const [hero, ...rest] = items;
  const isEmpty = items.length === 0;
  const filtered = Boolean(terms) || type !== "all";

  return (
    <div>
      {/* Recherche + filtres */}
      <SearchField
        defaultValue={initialTerms}
        placeholder="Rechercher dans le fil"
        onSearch={setTerms}
        className="mb-3"
      />
      <FilterChips
        options={FEED_TYPE_CHIPS}
        value={type}
        onChange={(v) => setType(v as FeedType)}
        className="mb-[18px]"
      />

      {/* Annonce de chargement pour les lecteurs d'écran */}
      <p aria-live="polite" className="sr-only">
        {refetching || loadingMore ? "Chargement de plus de contenus…" : ""}
      </p>

      {refetching ? (
        <FeedSkeleton />
      ) : error === "page" ? (
        <ErrorCard
          message="Impossible de charger le fil."
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={SearchX}
          title="Aucun résultat"
          description={
            terms
              ? `Aucun contenu pour « ${terms} »${
                  type !== "all" ? " avec ce filtre" : ""
                }.`
              : "Aucun contenu pour ce filtre."
          }
          action={
            filtered ? (
              <Button variant="secondary" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {hero && <HeroCard data={toHeroData(hero)} className="mb-[18px]" />}

          {rest.length > 0 && (
            <h2 className="mb-3.5 mt-[22px] font-display text-[17px] font-extrabold tracking-[-0.01em]">
              Récemment publié
            </h2>
          )}

          <div className="grid gap-3 lg:grid-cols-2">
            {rest.map((c) => (
              <ContentCard key={c.id} data={toCardData(c)} />
            ))}
          </div>

          {error === "more" && (
            <ErrorCard
              message="Échec du chargement."
              onRetry={loadMore}
              compact
            />
          )}

          {loadingMore && (
            <div className="mt-3">
              <ContentListSkeleton count={2} />
            </div>
          )}

          <InfiniteSentinel
            onLoadMore={loadMore}
            hasNext={hasNext}
            loading={loadingMore}
          />
        </>
      )}
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-[var(--radius)] border border-danger/35 bg-surface px-4 ${
        compact ? "mt-3 py-2.5" : "py-3.5"
      }`}
    >
      <span className="text-sm text-text-dim">{message}</span>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Réessayer
      </Button>
    </div>
  );
}

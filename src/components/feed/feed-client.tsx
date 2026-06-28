"use client";

import { EyeOff, SlidersHorizontal, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ContentCard, HeroCard } from "@/components/content/content-card";
import { ContentListSkeleton } from "@/components/content/content-card-skeleton";
import { Button } from "@/components/ui/button";
import { DismissToast } from "@/components/ui/dismiss-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { SearchField } from "@/components/ui/search-field";
import { getLastContent } from "@/lib/api/content";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { ContentLite, ListMetaMedia } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { useDismissedFeed } from "@/lib/dismissed-feed";
import { useFeedMediaFilter } from "@/lib/feed-media-filter";
import { useFeedPrefs } from "@/lib/feed-prefs";
import type { SavedArticle } from "@/lib/reading-list";
import {
  combinedMediaKeys,
  FEED_TYPES,
  type FeedType,
  toCardData,
  toHeroData,
} from "./feed-utils";
import { DismissableCard } from "./dismissable-card";
import { FeedSkeleton } from "./feed-skeleton";
import { MediaFilterSheet } from "./media-filter-sheet";

/** Page vide (utilisée quand le croisement type × médias est contradictoire). */
const EMPTY_PAGE: UnifiedPage<ContentLite> = {
  items: [],
  page: 1,
  hasNext: false,
};

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
  const t = useTranslations("feed");

  const { prefs, setType: persistType } = useFeedPrefs();
  // Type initial : préférence persistée si disponible (non-"all"), sinon initialType URL.
  const [type, setType] = useState<FeedType>(() =>
    prefs.type !== "all" ? prefs.type : initialType,
  );
  const ecoMode = prefs.ecoMode;

  // Filtre par sources (médias) — persisté en localStorage, additif au type.
  const { selected: selectedMedia, setAll: setSelectedMedia } =
    useFeedMediaFilter();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [items, setItems] = useState<ContentLite[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);

  const [terms, setTerms] = useState(initialTerms);

  const [loadingMore, setLoadingMore] = useState(false);
  const [refetching, setRefetching] = useState(false);
  const [error, setError] = useState<"page" | "more" | null>(null);
  // Incrémenté pour re-déclencher le fetch page 1 (réessai sur erreur).
  const [retryKey, setRetryKey] = useState(0);

  // Dismiss
  const { dismissed, dismiss, undoDismiss } = useDismissedFeed();
  const [pendingUndo, setPendingUndo] = useState<string | null>(null);

  // Évite que le re-fetch initial (déclenché par l'effet) écrase la 1ère page SSR.
  const firstRender = useRef(true);

  const fetchPage = useCallback(
    async (targetPage: number, t: string, ty: FeedType, media: string[]) => {
      const keys = combinedMediaKeys(ty, media, medias);
      // Croisement contradictoire (ex. « Vidéos » + uniquement des médias
      // articles) → aucun résultat, sans appel réseau inutile.
      if (keys && keys.length === 0) return EMPTY_PAGE;
      return getLastContent({
        page: targetPage,
        size: PAGE_SIZE,
        terms: t || undefined,
        mediaKeys: keys,
      });
    },
    [medias],
  );

  // Re-fetch page 1 quand terms/type/sélection changent (hors 1er rendu = page SSR).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    let cancelled = false;
    setRefetching(true);
    setError(null);
    fetchPage(1, terms, type, selectedMedia)
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
  }, [terms, type, selectedMedia, retryKey, fetchPage]);

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
      const res = await fetchPage(page + 1, terms, type, selectedMedia);
      setItems((prev) => [...prev, ...res.items]);
      setPage(res.page);
      setHasNext(res.hasNext);
    } catch {
      setError("more");
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasNext, fetchPage, page, terms, type, selectedMedia]);

  function resetFilters() {
    setTerms("");
    setType("all");
    persistType("all");
    setSelectedMedia([]);
  }

  function handleDismiss(contentId: string) {
    dismiss(contentId);
    setPendingUndo(contentId);
  }

  function handleUndo() {
    if (pendingUndo) undoDismiss(pendingUndo);
    setPendingUndo(null);
  }

  // Filtre les articles masqués
  const visibleItems = items.filter((c) => !dismissed.has(c.contentId));

  // Si la page visible est presque vide et qu'il reste des pages, charger plus
  useEffect(() => {
    if (visibleItems.length < 3 && hasNext && !loadingMore && !refetching) {
      void loadMore();
    }
  }, [visibleItems.length, hasNext, loadingMore, refetching, loadMore]);

  const [hero, ...rest] = visibleItems;
  const isEmpty = visibleItems.length === 0;
  const allDismissed = items.length > 0 && visibleItems.length === 0 && !hasNext;
  const filtered = Boolean(terms) || type !== "all" || selectedMedia.length > 0;

  /** Construit le SavedArticle minimal depuis un ContentLite (pas de backend). */
  function toSavedArticle(c: ContentLite): Omit<SavedArticle, "savedAt"> {
    return {
      id: c.id,
      contentId: c.contentId,
      mediaKey: c.metaMedia.key,
      title: c.title,
      publishedAt: c.publishedAt,
      imageUrl: c.image?.url,
      mediaTitle: c.metaMedia.title,
      mediaType: c.metaMedia.type,
    };
  }

  return (
    <div>
      {/* Recherche + filtres */}
      <SearchField
        defaultValue={initialTerms}
        placeholder={t("searchPlaceholder")}
        onSearch={setTerms}
        className="mb-3"
      />
      <div className="mb-[18px] flex items-center gap-2">
        <FilterChips
          options={FEED_TYPES.map((v) => ({ value: v, label: t(`chips.${v}`) }))}
          value={type}
          onChange={(v) => {
            const next = v as FeedType;
            setType(next);
            persistType(next);
          }}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          onClick={() => setFilterSheetOpen(true)}
          aria-label={t("mediaFilter.open")}
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors",
            selectedMedia.length > 0
              ? "border-primary bg-primary/15 text-tag-text-orange"
              : "border-border bg-surface-2 text-text-dim hover:border-text-faint hover:text-text",
          )}
        >
          <SlidersHorizontal className="size-[18px]" aria-hidden />
          {selectedMedia.length > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-[18px] text-on-primary">
              {selectedMedia.length}
            </span>
          )}
        </button>
      </div>

      <MediaFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        groups={medias}
        selected={selectedMedia}
        onApply={setSelectedMedia}
      />

      {/* Annonce de chargement pour les lecteurs d'écran */}
      <p aria-live="polite" className="sr-only">
        {refetching || loadingMore ? t("loadingMore") : ""}
      </p>

      {refetching ? (
        <FeedSkeleton />
      ) : error === "page" ? (
        <ErrorCard
          message={t("errorPage")}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      ) : allDismissed ? (
        <EmptyState
          icon={EyeOff}
          title={t("emptyTitle")}
          description={t("emptyDescDismissed")}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={SearchX}
          title={t("emptyTitle")}
          description={
            terms
              ? type !== "all"
                ? t("emptyDescTermsFiltered", { terms })
                : t("emptyDescTerms", { terms })
              : t("emptyDescFilter")
          }
          action={
            filtered ? (
              <Button variant="secondary" onClick={resetFilters}>
                {t("resetFilters")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {hero && (
            <DismissableCard
              contentId={hero.contentId}
              onDismiss={handleDismiss}
              className="mb-[18px]"
            >
              <HeroCard
                data={toHeroData(hero, ecoMode)}
                actions={
                  <BookmarkButton
                    article={toSavedArticle(hero)}
                    variant="feed"
                  />
                }
              />
            </DismissableCard>
          )}

          {rest.length > 0 && (
            <h2 className="mb-3.5 mt-[22px] font-display text-[17px] font-extrabold tracking-[-0.01em]">
              {t("recentlyPublished")}
            </h2>
          )}

          <div className="grid gap-3 lg:grid-cols-2">
            {rest.map((c) => (
              <DismissableCard
                key={c.id}
                contentId={c.contentId}
                onDismiss={handleDismiss}
              >
                <ContentCard
                  data={toCardData(c, ecoMode)}
                  actions={
                    <BookmarkButton
                      article={toSavedArticle(c)}
                      variant="feed"
                    />
                  }
                />
              </DismissableCard>
            ))}
          </div>

          {error === "more" && (
            <ErrorCard
              message={t("errorMore")}
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

      {pendingUndo && (
        <DismissToast
          onUndo={handleUndo}
          onClose={() => setPendingUndo(null)}
        />
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
  const t = useTranslations("common");
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-[var(--radius)] border border-danger/35 bg-surface px-4 ${
        compact ? "mt-3 py-2.5" : "py-3.5"
      }`}
    >
      <span className="text-sm text-text-dim">{message}</span>
      <Button variant="secondary" size="sm" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
}

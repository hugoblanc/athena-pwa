"use client";

import { EyeOff, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useDismissedFeed } from "@/lib/dismissed-feed";
import {
  FEED_TYPES,
  type FeedType,
  mediaKeysForType,
  toCardData,
  toHeroData,
} from "./feed-utils";
import { DismissableCard } from "./dismissable-card";
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
  const t = useTranslations("feed");

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

  // Dismiss
  const { dismissed, dismiss, undoDismiss } = useDismissedFeed();
  const [pendingUndo, setPendingUndo] = useState<string | null>(null);

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
  const filtered = Boolean(terms) || type !== "all";

  return (
    <div>
      {/* Recherche + filtres */}
      <SearchField
        defaultValue={initialTerms}
        placeholder={t("searchPlaceholder")}
        onSearch={setTerms}
        className="mb-3"
      />
      <FilterChips
        options={FEED_TYPES.map((v) => ({ value: v, label: t(`chips.${v}`) }))}
        value={type}
        onChange={(v) => setType(v as FeedType)}
        className="mb-[18px]"
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
              <HeroCard data={toHeroData(hero)} />
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
                <ContentCard data={toCardData(c)} />
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

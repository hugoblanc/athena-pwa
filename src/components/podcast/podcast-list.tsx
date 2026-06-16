"use client";

import { Music, WifiOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  PodcastCard,
  PodcastListSkeleton,
} from "@/components/content/podcast-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import { SearchField } from "@/components/ui/search-field";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { Podcast } from "@/lib/api/types";

const PAGE_SIZE = 10;

/** N'affiche comme jouables que les podcasts terminés avec un audio. */
function isPlayable(p: Podcast): boolean {
  return p.status?.toUpperCase() === "COMPLETED" && Boolean(p.audioUrl);
}

async function fetchPage(
  terms: string,
  page: number,
): Promise<UnifiedPage<Podcast>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
  });
  if (terms) params.set("terms", terms);
  const res = await fetch(`/api/podcasts?${params}`);
  if (!res.ok) throw new Error("fetch failed");
  return (await res.json()) as UnifiedPage<Podcast>;
}

/**
 * Orchestrateur client de la liste podcasts : reçoit la 1ʳᵉ page rendue par le
 * serveur (hydratation), gère la recherche debouncée synchronisée à l'URL,
 * la pagination « charger plus » et les états loading/empty/error/offline.
 */
export function PodcastList({
  initialPage,
  initialTerms,
}: {
  initialPage: UnifiedPage<Podcast>;
  initialTerms: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [terms, setTerms] = useState(initialTerms);
  const [items, setItems] = useState<Podcast[]>(initialPage.items);
  const [page, setPage] = useState(initialPage.page);
  const [hasNext, setHasNext] = useState(initialPage.hasNext);
  const [total, setTotal] = useState(initialPage.total);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [online, setOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  // Évite un refetch redondant au montage (la 1ʳᵉ page vient du serveur).
  const skipNext = useRef(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // Recherche : sync URL + refetch page 1.
  const onSearch = useCallback(
    (value: string) => {
      if (value === terms) return;
      setTerms(value);
      const qs = value ? `?q=${encodeURIComponent(value)}` : "";
      startTransition(() => {
        router.replace(`${pathname}${qs}`, { scroll: false });
      });
    },
    [terms, pathname, router],
  );

  // Refetch quand `terms` change (sauf au tout premier rendu).
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetchPage(terms, 1)
      .then((p) => {
        if (cancelled) return;
        setItems(p.items);
        setPage(p.page);
        setHasNext(p.hasNext);
        setTotal(p.total);
        setStatus("idle");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [terms]);

  const loadMore = useCallback(() => {
    if (status === "loading" || !hasNext || !online) return;
    setStatus("loading");
    fetchPage(terms, page + 1)
      .then((p) => {
        setItems((prev) => [...prev, ...p.items]);
        setPage(p.page);
        setHasNext(p.hasNext);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [status, hasNext, online, terms, page]);

  const retry = useCallback(() => {
    setStatus("loading");
    fetchPage(terms, 1)
      .then((p) => {
        setItems(p.items);
        setPage(p.page);
        setHasNext(p.hasNext);
        setTotal(p.total);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [terms]);

  const visible = items.filter(isPlayable);
  const isSearching = status === "loading" && page === 1;

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-5 mb-1 bg-bg/85 px-5 pb-3 pt-1 backdrop-blur-sm">
        <SearchField
          defaultValue={initialTerms}
          placeholder="Rechercher un podcast…"
          onSearch={onSearch}
          delay={350}
        />
        <div
          className="mt-2 h-4 text-xs text-text-dim"
          role="status"
          aria-live="polite"
        >
          {total != null && status !== "loading"
            ? `${total} podcast${total > 1 ? "s" : ""}${
                terms ? ` pour « ${terms} »` : ""
              }`
            : ""}
        </div>
      </div>

      {!online && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text-dim">
          <WifiOff className="size-4 shrink-0" />
          Hors ligne — liste possiblement non à jour.
        </div>
      )}

      {status === "error" && visible.length === 0 ? (
        <div className="rounded-[var(--radius)] border border-danger/30 bg-danger/10 px-4 py-8 text-center">
          <p className="mb-3 text-sm text-text">
            Impossible de charger les podcasts.
          </p>
          <Button variant="secondary" onClick={retry}>
            Réessayer
          </Button>
        </div>
      ) : isSearching ? (
        <PodcastListSkeleton count={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Music}
          title={
            terms ? `Aucun résultat pour « ${terms} »` : "Aucun podcast pour l'instant"
          }
          description={
            terms
              ? undefined
              : "Les podcasts générés par Athena apparaîtront ici."
          }
          action={
            terms ? (
              <Button variant="secondary" onClick={() => onSearch("")}>
                Effacer la recherche
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((p) => (
            <PodcastCard key={p.id} podcast={p} />
          ))}
        </div>
      )}

      {status === "error" && visible.length > 0 && (
        <div className="py-4 text-center">
          <Button variant="secondary" onClick={retry}>
            Réessayer
          </Button>
        </div>
      )}

      {visible.length > 0 && online && (
        <InfiniteSentinel
          onLoadMore={loadMore}
          hasNext={hasNext}
          loading={status === "loading"}
        />
      )}
    </div>
  );
}

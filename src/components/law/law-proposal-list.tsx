"use client";

import { Scale, SearchX } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteSentinel } from "@/components/ui/infinite-sentinel";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { LawProposalSummary } from "@/lib/api/types";
import { LawProposalCard } from "./law-proposal-card";
import { loadMoreLawProposals } from "./actions";
import type { LawFilterState } from "./filters";

/**
 * Liste cliente des propositions : reçoit la 1re page (SSR) en props, gère
 * l'append via la Server Action + les états empty / error.
 * Reset complet quand la 1re page change (changement de filtre côté RSC).
 */
export function LawProposalList({
  firstPage,
  filterState,
  hasActiveFilters,
}: {
  firstPage: UnifiedPage<LawProposalSummary>;
  filterState: LawFilterState;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState(firstPage.items);
  const [page, setPage] = useState(firstPage.page);
  const [hasNext, setHasNext] = useState(firstPage.hasNext);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function loadMore() {
    setError(false);
    startTransition(async () => {
      try {
        const next = await loadMoreLawProposals(filterState, page + 1);
        setItems((prev) => [...prev, ...next.items]);
        setPage(next.page);
        setHasNext(next.hasNext);
      } catch {
        setError(true);
      }
    });
  }

  if (items.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        icon={SearchX}
        title="Aucune proposition ne correspond"
        description="Essayez d'élargir vos filtres."
        action={
          <Button
            variant="secondary"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            Effacer les filtres
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={Scale}
        title="Aucune proposition pour l'instant"
        description="Les propositions de loi déposées apparaîtront ici."
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3" aria-busy={pending}>
        {items.map((p) => (
          <li key={p.numero}>
            <LawProposalCard data={p} />
          </li>
        ))}
      </ul>

      {error && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-text-dim">
            Impossible de charger plus de propositions.
          </p>
          <Button variant="secondary" onClick={loadMore}>
            Réessayer
          </Button>
        </div>
      )}

      {!error && (
        <InfiniteSentinel
          onLoadMore={loadMore}
          hasNext={hasNext}
          loading={pending}
        />
      )}
    </>
  );
}

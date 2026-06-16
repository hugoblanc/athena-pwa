import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { LawFilterBar } from "@/components/law/law-filter-bar";
import { LawProposalList } from "@/components/law/law-proposal-list";
import {
  filtersToSearchParams,
  parseFilterState,
  toApiFilters,
} from "@/components/law/filters";
import { listLawProposals } from "@/lib/api/law-proposal";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { LawProposalSummary } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Propositions de loi — Athena",
  description:
    "Parcourez et filtrez les propositions de loi déposées à l'Assemblée nationale, avec repérage politique et résumés simplifiés par IA.",
};

export default async function PropositionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const state = parseFilterState(sp);

  let firstPage: UnifiedPage<LawProposalSummary> | null = null;
  let failed = false;
  try {
    firstPage = await listLawProposals(toApiFilters(state, 1));
  } catch {
    failed = true;
  }

  const hasActiveFilters =
    state.groupe.length > 0 || !!state.type || !!state.statut;

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <header className="mb-4">
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">
          Propositions de loi
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Les textes déposés à l&apos;Assemblée, avec leur résumé simplifié.
        </p>
      </header>

      <div className="mb-5">
        <LawFilterBar state={state} total={firstPage?.total} />
      </div>

      {failed || !firstPage ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-text-dim">
            Impossible de charger les propositions.
          </p>
          <form>
            <Button type="submit" variant="secondary">
              Réessayer
            </Button>
          </form>
        </div>
      ) : (
        <LawProposalList
          key={filtersToSearchParams(state).toString()}
          firstPage={firstPage}
          filterState={state}
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  );
}

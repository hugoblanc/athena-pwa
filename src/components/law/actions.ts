"use server";

import { listLawProposals } from "@/lib/api/law-proposal";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { LawProposalSummary } from "@/lib/api/types";
import { toApiFilters, type LawFilterState } from "./filters";

/**
 * Server Action : récupère une page suivante de propositions.
 * Appelée par `<LawProposalList>` (client) pour le « Charger plus ».
 */
export async function loadMoreLawProposals(
  state: LawFilterState,
  page: number,
): Promise<UnifiedPage<LawProposalSummary>> {
  return listLawProposals(toApiFilters(state, page));
}

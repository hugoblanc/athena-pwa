import { apiGet } from "./client";
import { CACHE } from "./config";
import {
  fromPaginationPage,
  type PaginationPage,
  type UnifiedPage,
} from "./pagination";
import type { LawProposal, LawProposalSummary } from "./types";

export interface LawProposalFilters {
  page?: number;
  limit?: number;
  sort?: string; // ex. "dateMiseEnLigne:desc"
  groupePolitique?: string[];
  typeProposition?: "ordinaire" | "constitutionnelle";
  dateDebut?: string;
  dateFin?: string;
  simplificationStatus?: "completed" | "pending" | "failed";
  include?: string;
}

/** Liste filtrée/paginée des propositions de loi. `GET /law-proposal` */
export async function listLawProposals(
  filters: LawProposalFilters = {},
): Promise<UnifiedPage<LawProposalSummary>> {
  const res = await apiGet<PaginationPage<LawProposalSummary>>("/law-proposal", {
    query: { ...filters },
    ...CACHE.list,
  });
  return fromPaginationPage(res);
}

/** Détail d'une proposition. `GET /law-proposal/:numero` */
export function getLawProposal(numero: string): Promise<LawProposal> {
  return apiGet<LawProposal>(`/law-proposal/${numero}`, CACHE.detail);
}

/** Statistiques. `GET /law-proposal/stats` */
export function getLawStats(): Promise<unknown> {
  return apiGet("/law-proposal/stats", CACHE.list);
}

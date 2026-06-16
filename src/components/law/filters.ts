import type { LawProposalFilters } from "@/lib/api/law-proposal";
import { POLITICAL_GROUPS } from "@/lib/law/political-groups";
import type { PoliticalGroupCode } from "@/lib/api/types";

/** Page size — décision produit transverse (orchestrateur). */
export const PAGE_SIZE = 10;

/** Options de tri (whitelist UI → `sort` API). */
export const SORT_OPTIONS = [
  { value: "date_desc", label: "Plus récentes", sort: "dateMiseEnLigne:desc" },
  { value: "date_asc", label: "Plus anciennes", sort: "dateMiseEnLigne:asc" },
  { value: "titre_asc", label: "Titre A→Z", sort: "titre:asc" },
  { value: "numero_desc", label: "N° décroissant", sort: "numero:desc" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "date_desc";

export const TYPE_OPTIONS = [
  { value: "", label: "Tous les types" },
  { value: "ordinaire", label: "Ordinaire" },
  { value: "constitutionnelle", label: "Constitutionnelle" },
] as const;

export const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "completed", label: "Simplifiées" },
  { value: "pending", label: "En cours" },
  { value: "failed", label: "Échouées" },
] as const;

/** Liste ordonnée des groupes (hors UNKNOWN) pour le filtre multi-sélection. */
export const GROUP_OPTIONS: { code: PoliticalGroupCode; label: string; color: string }[] =
  (Object.keys(POLITICAL_GROUPS) as PoliticalGroupCode[])
    .filter((code) => code !== "UNKNOWN")
    .map((code) => ({ code, ...POLITICAL_GROUPS[code] }));

/** État des filtres tel que reflété dans l'URL (valeurs brutes). */
export interface LawFilterState {
  groupe: string[]; // CSV éclaté en codes
  type: string;
  statut: string;
  tri: SortValue;
}

/** Lit l'état des filtres depuis des searchParams (forme Next : objet plat). */
export function parseFilterState(
  sp: Record<string, string | string[] | undefined>,
): LawFilterState {
  const get = (k: string): string =>
    Array.isArray(sp[k]) ? (sp[k] as string[])[0] ?? "" : (sp[k] as string) ?? "";
  const groupeRaw = get("groupe");
  const tri = get("tri");
  return {
    groupe: groupeRaw ? groupeRaw.split(",").filter(Boolean) : [],
    type: get("type"),
    statut: get("statut"),
    tri: (SORT_OPTIONS.some((o) => o.value === tri) ? tri : DEFAULT_SORT) as SortValue,
  };
}

/** Mappe l'état UI vers les filtres API (whitelist + page/limit). */
export function toApiFilters(
  state: LawFilterState,
  page: number,
): LawProposalFilters {
  const sort =
    SORT_OPTIONS.find((o) => o.value === state.tri)?.sort ??
    SORT_OPTIONS[0].sort;
  return {
    page,
    limit: PAGE_SIZE,
    sort,
    groupePolitique: state.groupe.length ? state.groupe : undefined,
    typeProposition:
      state.type === "ordinaire" || state.type === "constitutionnelle"
        ? state.type
        : undefined,
    simplificationStatus:
      state.statut === "completed" ||
      state.statut === "pending" ||
      state.statut === "failed"
        ? state.statut
        : undefined,
  };
}

/** Nombre de filtres actifs (hors tri). */
export function activeFilterCount(state: LawFilterState): number {
  return (
    (state.groupe.length ? 1 : 0) +
    (state.type ? 1 : 0) +
    (state.statut ? 1 : 0)
  );
}

/** Sérialise l'état en query string (sans `page`, reset implicite). */
export function filtersToSearchParams(state: LawFilterState): URLSearchParams {
  const sp = new URLSearchParams();
  if (state.groupe.length) sp.set("groupe", state.groupe.join(","));
  if (state.type) sp.set("type", state.type);
  if (state.statut) sp.set("statut", state.statut);
  if (state.tri !== DEFAULT_SORT) sp.set("tri", state.tri);
  return sp;
}

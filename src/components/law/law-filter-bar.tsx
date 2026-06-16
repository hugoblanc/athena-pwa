"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { GroupMultiSelect } from "./group-multi-select";
import { LawFilterSheet } from "./law-filter-sheet";
import { SelectField } from "./select-field";
import {
  STATUS_OPTIONS,
  SORT_OPTIONS,
  TYPE_OPTIONS,
  activeFilterCount,
  filtersToSearchParams,
  type LawFilterState,
  type SortValue,
} from "./filters";

/**
 * Barre de filtres : écrit l'état dans l'URL (`router.replace`, scroll:false),
 * ce qui re-render le Server Component avec la liste filtrée.
 * Desktop = sélecteurs inline ; mobile = chips tri + bouton « Filtres » → feuille.
 */
export function LawFilterBar({
  state,
  total,
}: {
  state: LawFilterState;
  total?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCount = activeFilterCount(state);

  const push = useCallback(
    (next: LawFilterState) => {
      const sp = filtersToSearchParams(next);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const setTri = (tri: string) => push({ ...state, tri: tri as SortValue });
  const setType = (type: string) => push({ ...state, type });
  const setStatut = (statut: string) => push({ ...state, statut });
  const toggleGroup = (code: string) =>
    push({
      ...state,
      groupe: state.groupe.includes(code)
        ? state.groupe.filter((c) => c !== code)
        : [...state.groupe, code],
    });
  const clear = () =>
    push({ groupe: [], type: "", statut: "", tri: "date_desc" });

  return (
    <div className="space-y-3">
      {/* tri (chips) — partout */}
      <FilterChips
        options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={state.tri}
        onChange={setTri}
      />

      {/* desktop : sélecteurs inline */}
      <div className="hidden items-center gap-2.5 lg:flex">
        <SelectField
          label="Type de proposition"
          value={state.type}
          options={TYPE_OPTIONS}
          onChange={setType}
          className="w-[180px]"
        />
        <SelectField
          label="Statut de simplification"
          value={state.statut}
          options={STATUS_OPTIONS}
          onChange={setStatut}
          className="w-[180px]"
        />
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <X className="size-4" />
            Effacer ({activeCount})
          </Button>
        )}
        {total != null && (
          <span
            className="ml-auto text-[13px] text-text-dim"
            aria-live="polite"
          >
            {total} proposition{total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* desktop : groupes multi en panneau */}
      <div className="hidden lg:block">
        <GroupMultiSelect selected={state.groupe} onToggle={toggleGroup} />
      </div>

      {/* mobile : bouton filtres + compteur résultats */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSheetOpen(true)}
          aria-label={
            activeCount > 0 ? `Filtres, ${activeCount} actifs` : "Filtres"
          }
        >
          <SlidersHorizontal className="size-4" />
          Filtres
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
              {activeCount}
            </span>
          )}
        </Button>
        {total != null && (
          <span className="text-[13px] text-text-dim" aria-live="polite">
            {total} résultat{total > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <LawFilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        state={state}
        onApply={push}
        onClear={clear}
        activeCount={activeCount}
      />
    </div>
  );
}

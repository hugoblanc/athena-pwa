"use client";

import { usePathname, useRouter } from "next/navigation";
import { FilterChips } from "@/components/ui/filter-chips";
import { STATUS_FILTERS } from "./status-badge";

/**
 * Filtres de la roadmap par statut. État porté par l'URL (`?statut=`),
 * `router.replace(scroll:false)` → re-render du Server Component avec la liste
 * filtrée. `counts` (optionnel) ajoute le nombre par statut dans les chips.
 */
export function RoadmapFilter({
  value,
  counts,
}: {
  value: string;
  counts?: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const options = STATUS_FILTERS.map((f) => {
    const n = f.value === "" ? counts?.__all : counts?.[f.value];
    return {
      value: f.value,
      label: typeof n === "number" ? `${f.label} (${n})` : f.label,
    };
  });

  function onChange(next: string) {
    router.replace(next ? `${pathname}?statut=${next}` : pathname, {
      scroll: false,
    });
  }

  // flex-wrap : les chips passent à la ligne au lieu de défiler horizontalement
  // (override local, sans toucher au comportement scroll du composant partagé).
  return (
    <FilterChips
      options={options}
      value={value}
      onChange={onChange}
      className="flex-wrap"
    />
  );
}

"use client";

import { usePathname, useRouter } from "next/navigation";
import { FilterChips } from "@/components/ui/filter-chips";
import { TYPE_FILTERS } from "./roadmap-meta";

/**
 * Filtre principal de la roadmap par type (Idées / Médias / Bugs). État porté
 * par l'URL (`?type=`). Changer de type réinitialise le filtre statut, pour
 * éviter une intersection vide (ex. media + in_progress). `counts` ajoute le
 * nombre par type dans les chips.
 */
export function RoadmapTypeFilter({
  value,
  counts,
}: {
  value: string;
  counts?: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const options = TYPE_FILTERS.map((f) => {
    const n = counts?.[f.value];
    return {
      value: f.value,
      label: typeof n === "number" ? `${f.label} (${n})` : f.label,
    };
  });

  function onChange(next: string) {
    router.replace(`${pathname}?type=${next}`, { scroll: false });
  }

  return (
    <FilterChips
      options={options}
      value={value}
      onChange={onChange}
      className="flex-wrap"
    />
  );
}

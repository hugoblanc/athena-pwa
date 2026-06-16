"use client";

import { cn } from "@/lib/cn";
import { GROUP_OPTIONS } from "./filters";

/**
 * Panneau de chips à cocher pour la multi-sélection de groupes politiques.
 * La couleur de groupe est redondante (point), le libellé reste porteur d'info.
 */
export function GroupMultiSelect({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (code: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Groupes politiques">
      {GROUP_OPTIONS.map((g) => {
        const active = selected.includes(g.code);
        return (
          <button
            key={g.code}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(g.code)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors",
              active
                ? "border-primary bg-primary/15 text-text"
                : "border-border bg-surface-2 text-text-dim hover:text-text",
            )}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: g.color }}
            />
            {g.label}
          </button>
        );
      })}
    </div>
  );
}

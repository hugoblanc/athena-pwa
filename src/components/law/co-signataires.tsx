"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DeputeChip } from "@/components/law/depute-chip";
import { cn } from "@/lib/cn";
import type { Depute } from "@/lib/api/types";

const PREVIEW = 8;

/**
 * Co-signataires : aperçu des N premiers en grille, expansion au clic.
 * Masqué côté parent si la liste est vide.
 */
export function CoSignataires({ deputes }: { deputes: Depute[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = deputes.length > PREVIEW;
  const visible = expanded ? deputes : deputes.slice(0, PREVIEW);

  return (
    <section aria-label="Co-signataires">
      <h2 className="mb-3 font-display text-[17px] font-extrabold tracking-[-0.01em]">
        Co-signataires
        <span className="ml-2 text-sm font-semibold text-text-dim">
          {deputes.length}
        </span>
      </h2>

      <ul className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        {visible.map((d, i) => (
          <li key={`${d.nom}-${i}`}>
            <DeputeChip depute={d} size={36} />
          </li>
        ))}
      </ul>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          Voir les {deputes.length} co-signataires
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
            aria-hidden
          />
        </button>
      )}
    </section>
  );
}

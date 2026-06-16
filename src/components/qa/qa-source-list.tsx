"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";
import { QaSourceCard } from "./qa-source-card";
import type { QaSource } from "@/lib/api/types";

const VISIBLE = 4;

function Grid({ sources }: { sources: QaSource[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {sources.map((s, i) => (
        <QaSourceCard key={`${s.contentId}-${i}`} source={s} />
      ))}
    </div>
  );
}

/**
 * Groupe les cartes sources d'une réponse (grille responsive 1/2 col).
 * Au-delà de 4 sources, les suivantes sont repliées dans un Collapsible.
 */
export function QaSourceList({ sources }: { sources: QaSource[] }) {
  if (!sources.length) return null;

  const head = sources.slice(0, VISIBLE);
  const rest = sources.slice(VISIBLE);

  return (
    <section className="mt-3" aria-label="Sources de la réponse">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-text-dim">
        Sources
      </div>

      <Grid sources={head} />

      {rest.length > 0 && (
        <Collapsible.Root className="mt-2.5">
          <Collapsible.Panel className="overflow-hidden">
            <div className="pb-2.5">
              <Grid sources={rest} />
            </div>
          </Collapsible.Panel>
          <Collapsible.Trigger className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[13px] font-semibold text-text-dim transition-colors hover:text-text">
            <ChevronDown className="size-4 transition-transform duration-200 group-data-[panel-open]:rotate-180" />
            <span className="group-data-[panel-open]:hidden">
              Voir {rest.length} source{rest.length > 1 ? "s" : ""} de plus
            </span>
            <span className="hidden group-data-[panel-open]:inline">
              Réduire les sources
            </span>
          </Collapsible.Trigger>
        </Collapsible.Root>
      )}
    </section>
  );
}

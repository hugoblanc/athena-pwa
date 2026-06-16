"use client";

import { Sparkles } from "lucide-react";
import { QA_SUGGESTIONS } from "./suggestions";

/**
 * Écran d'accueil du QA quand aucune conversation n'est active :
 * hero + accroche + questions suggérées cliquables (envoi direct).
 */
export function QaZeroState({
  onPick,
}: {
  onPick: (question: string) => void;
}) {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-5 pt-10 text-center lg:pt-16">
      <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="size-8" />
      </div>

      <h1 className="mt-5 font-display text-[26px] font-extrabold tracking-[-0.02em]">
        Demande à Athena
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-dim">
        Pose une question sur l&apos;actualité des médias libres. Athena te
        répond en citant ses sources.
      </p>

      <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
        {QA_SUGGESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-left text-[14px] font-medium text-text shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

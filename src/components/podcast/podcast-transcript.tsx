"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronDown } from "lucide-react";

/**
 * Transcription/dialogue dépliable (`Collapsible` Base UI). `dialogueText` est
 * du texte brut (dialogue) → rendu en préservant les sauts de ligne.
 */
export function PodcastTranscript({ text }: { text: string }) {
  const trimmed = text?.trim();
  if (!trimmed) return null;

  return (
    <Collapsible.Root className="rounded-[var(--radius)] border border-border bg-surface shadow-elev-1">
      <Collapsible.Trigger className="group flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left font-display text-[15px] font-bold">
        Transcription
        <ChevronDown className="size-5 shrink-0 text-text-dim transition-transform duration-200 group-data-[panel-open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Panel className="overflow-hidden">
        <p className="whitespace-pre-line border-t border-border px-4 py-4 text-sm leading-relaxed text-text-dim">
          {trimmed}
        </p>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

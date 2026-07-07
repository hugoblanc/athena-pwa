"use client";

import { AArrowDown, AArrowUp } from "lucide-react";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import {
  READER_FONT_SCALES,
  getScale,
  getServerScale,
  setScale,
  subscribe,
} from "@/lib/reader-font";

/**
 * Enveloppe cliente du corps d'article : propose un réglage de taille du texte
 * (#124) et l'applique via la variable CSS `--reader-font-scale` consommée par
 * `.prose` (globals.css). Le corps reste un Server Component, passé en
 * `children`. La préférence est persistée dans localStorage (cf. lib/reader-font).
 */
export function ReaderScale({ children }: { children: ReactNode }) {
  const scale = useSyncExternalStore(subscribe, getScale, getServerScale);
  const index = READER_FONT_SCALES.indexOf(scale);
  const atMin = index <= 0;
  const atMax = index >= READER_FONT_SCALES.length - 1;

  return (
    <div style={{ "--reader-font-scale": scale } as CSSProperties}>
      <div className="mb-4 flex items-center justify-end gap-1.5">
        <span className="mr-1 text-xs font-medium text-text-dim">
          Taille du texte
        </span>
        <ScaleButton
          disabled={atMin}
          onClick={() => setScale(READER_FONT_SCALES[Math.max(0, index - 1)])}
          aria-label="Réduire la taille du texte"
        >
          <AArrowDown aria-hidden />
        </ScaleButton>
        <ScaleButton
          disabled={atMax}
          onClick={() =>
            setScale(
              READER_FONT_SCALES[
                Math.min(READER_FONT_SCALES.length - 1, index + 1)
              ],
            )
          }
          aria-label="Augmenter la taille du texte"
        >
          <AArrowUp aria-hidden />
        </ScaleButton>
      </div>
      {children}
    </div>
  );
}

/** Petit bouton carré du réglage (repris du style d'`IconButton`, en plus compact). */
function ScaleButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-9 place-items-center rounded-[var(--radius-sm)] border border-border bg-surface-2 text-text-dim transition-colors duration-150 [&_svg]:size-5",
        "hover:border-text-faint hover:text-text",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-text-dim",
        className,
      )}
      {...props}
    />
  );
}

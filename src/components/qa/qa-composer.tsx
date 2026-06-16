"use client";

import { ArrowUp, Square } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

const MAX_HEIGHT = 140; // ~5 lignes

/**
 * Composer (style ChatGPT) : textarea auto-grow, envoi Entrée, retour ligne
 * Maj+Entrée, bouton envoi/stop. Le positionnement (sticky bas) est géré par
 * le parent ; ce composant ne rend que la barre.
 */
export function QaComposer({
  onSend,
  onStop,
  busy,
  offline,
}: {
  onSend: (value: string) => void;
  onStop: () => void;
  busy: boolean;
  offline: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function submit() {
    const v = value.trim();
    if (!v || busy || offline) return;
    onSend(v);
    setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const sendDisabled = offline || value.trim().length === 0;

  return (
    <div className="w-full">
      {offline && (
        <div className="mb-2 rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-center text-[12.5px] text-text-dim">
          Hors ligne — la recherche IA nécessite une connexion.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-2 shadow-elev-2"
      >
        <label htmlFor="qa-input" className="sr-only">
          Pose ta question à Athena
        </label>
        <textarea
          id="qa-input"
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={offline}
          placeholder="Pose ta question à Athena…"
          className="max-h-[140px] min-h-[28px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[16px] leading-snug text-text placeholder:text-text-faint focus:outline-none disabled:opacity-50"
        />

        {busy ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Arrêter la génération"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-text transition-colors hover:bg-border"
          >
            <Square className="size-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={sendDisabled}
            aria-label="Envoyer la question"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-[background,opacity] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="size-5" />
          </button>
        )}
      </form>
    </div>
  );
}

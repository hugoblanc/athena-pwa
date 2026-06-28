"use client";

import { ArrowLeft, Check, Copy, Rss } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { MediaMultiSelect } from "@/components/content/media-multi-select";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";
import type { ListMetaMedia } from "@/lib/api/types";

/** Construit l'URL du flux RSS : aucun média = tous, sinon param `medias`. */
function buildRssUrl(selected: string[]): string {
  const base = `${API_BASE_URL}/content/rss`;
  if (!selected.length) return base;
  return `${base}?medias=${selected.map(encodeURIComponent).join(",")}`;
}

/**
 * Copie dans le presse-papiers avec repli : API Clipboard moderne (contexte
 * sécurisé) puis `execCommand("copy")` sur un textarea temporaire (Safari iOS,
 * contextes non sécurisés). Renvoie `false` si tout échoue.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* on tente le repli execCommand ci-dessous */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Générateur de flux RSS personnalisé : l'utilisateur choisit ses médias, on
 * construit l'URL `${API}/content/rss?medias=…` et on propose de la copier.
 * Seul paramètre configurable : la sélection des médias.
 */
export function RssFeedBuilder({ groups }: { groups: ListMetaMedia[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const url = buildRssUrl(selected);

  function toggle(key: string) {
    setCopyState("idle");
    setSelected((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key],
    );
  }

  async function copy() {
    if (await writeToClipboard(url)) {
      setCopyState("copied");
      window.setTimeout(
        () => setCopyState((s) => (s === "copied" ? "idle" : s)),
        2000,
      );
    } else {
      setCopyState("error");
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-24 pt-4 lg:pb-10 lg:pt-6">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-dim transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        Profil
      </Link>

      <div className="mb-2 flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-[10px] bg-primary/15 text-primary">
          <Rss className="size-5" aria-hidden />
        </span>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">
          Mon flux RSS
        </h1>
      </div>
      <p className="mb-6 text-sm text-text-dim">
        Composez un flux RSS à partir des médias de votre choix, à suivre dans
        votre lecteur préféré. Sans sélection, le flux couvre tous les médias.
      </p>

      {/* URL générée + copie : sticky pour rester visible pendant la sélection. */}
      <div className="sticky top-2 z-10 mb-6 rounded-[var(--radius)] border border-border bg-surface p-3 shadow-elev-1">
        <p className="mb-2 text-[13px] font-semibold text-text-dim">
          {selected.length
            ? `${selected.length} média${selected.length > 1 ? "s" : ""} sélectionné${selected.length > 1 ? "s" : ""}`
            : "Tous les médias"}
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-[8px] bg-surface-2 px-3 py-2 text-[13px] text-text">
            {url}
          </code>
          <Button size="sm" onClick={copy} className="shrink-0">
            {copyState === "copied" ? (
              <>
                <Check aria-hidden />
                Copié
              </>
            ) : (
              <>
                <Copy aria-hidden />
                Copier
              </>
            )}
          </Button>
        </div>
        {copyState === "error" && (
          <p role="alert" className="mt-2 text-[13px] text-danger">
            {"Copie automatique impossible — sélectionnez l'URL ci-dessus pour la copier manuellement."}
          </p>
        )}
      </div>

      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-text-dim">
        Médias
      </h2>
      <MediaMultiSelect groups={groups} selected={selected} onToggle={toggle} />
    </div>
  );
}

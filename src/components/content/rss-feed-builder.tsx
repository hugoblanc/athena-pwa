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
  return selected.length ? `${base}?medias=${selected.join(",")}` : base;
}

/**
 * Générateur de flux RSS personnalisé : l'utilisateur choisit ses médias, on
 * construit l'URL `${API}/content/rss?medias=…` et on propose de la copier.
 * Seul paramètre configurable : la sélection des médias.
 */
export function RssFeedBuilder({ groups }: { groups: ListMetaMedia[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const url = buildRssUrl(selected);

  function toggle(key: string) {
    setCopied(false);
    setSelected((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key],
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponible : l'URL reste sélectionnable manuellement */
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
            {copied ? (
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
      </div>

      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-text-dim">
        Médias
      </h2>
      <MediaMultiSelect groups={groups} selected={selected} onToggle={toggle} />
    </div>
  );
}

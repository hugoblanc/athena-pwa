"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { useState } from "react";
import { usePlayerStore } from "@/components/player/player-store";
import { Button } from "@/components/ui/button";
import { getAudioContentUrl } from "@/lib/api/content";

export interface ListenTrackInfo {
  id: string;
  title: string;
  source: string;
  artwork?: string;
  href: string;
}

/**
 * Bouton « Écouter l'article » (client leaf).
 * Au 1er clic : fetch lazy de l'URL audio TTS puis push dans le player global.
 * Si la piste de ce contenu est déjà chargée : agit en play/pause (toggle).
 */
export function ListenButton({ track }: { track: ListenTrackInfo }) {
  const [loading, setLoading] = useState(false);
  const current = usePlayerStore((s) => s.track);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);

  const isCurrent = current?.id === track.id;
  const active = isCurrent && isPlaying;

  async function onClick() {
    if (isCurrent) {
      toggle();
      return;
    }
    setLoading(true);
    try {
      // L'endpoint TTS renvoie `{ url }` ; le type lib le déclare comme
      // ShareableContentResponse (originalUrl). On lit les deux par robustesse.
      const res = (await getAudioContentUrl(track.id)) as {
        url?: string;
        originalUrl?: string;
      };
      const audioUrl = res.url ?? res.originalUrl;
      if (!audioUrl) return;
      play({
        id: track.id,
        title: track.title,
        source: track.source,
        audioUrl,
        artwork: track.artwork,
        href: track.href,
        analytics: { refType: "content", refId: track.id },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      aria-pressed={active}
      aria-label={
        active ? "Mettre en pause" : "Écouter la version audio de l'article"
      }
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : active ? (
        <Pause />
      ) : (
        <Play />
      )}
      {active ? "En lecture" : "Écouter l'article"}
    </Button>
  );
}

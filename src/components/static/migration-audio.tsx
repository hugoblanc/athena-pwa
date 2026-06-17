"use client";

import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Lecteur audio sobre pour le « mot vocal » optionnel de la page /evolution.
 * Rendu uniquement si un fichier audio est présent (détecté côté serveur).
 */
export function MigrationAudio({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  return (
    <div className="my-6 flex items-center gap-3 rounded-[var(--radius)] border border-border bg-surface p-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mettre en pause" : "Écouter"}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary"
      >
        {playing ? (
          <Pause className="size-5" />
        ) : (
          <Play className="size-5 translate-x-[1px]" />
        )}
      </button>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-text">{label}</p>
        <p className="text-[12.5px] text-text-dim">Quelques mots, de vive voix.</p>
      </div>
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

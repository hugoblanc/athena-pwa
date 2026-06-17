"use client";

import { Music, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import {
  PLAYBACK_RATES,
  formatTime,
  usePlayerStore,
  type Track,
} from "@/components/player/player-store";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { mediaLogoSrc } from "@/lib/media";
import type { Podcast } from "@/lib/api/types";

/**
 * Now Playing inline du détail podcast : pochette, titre/source, scrubber lié
 * au player singleton, contrôles lecture / -15s / +30s et vitesse. Quand une
 * autre piste joue, propose « Lire ce podcast » (remplace la piste).
 */
export function PodcastPlayPanel({ podcast }: { podcast: Podcast }) {
  const content = podcast.content;
  const title = content?.title ?? "Podcast Athena";
  const source = content?.meta_media?.title ?? "Athena";
  const logo = mediaLogoSrc(content?.meta_media?.logo);
  const artwork = content?.image?.url ?? logo;

  const track = usePlayerStore((s) => s.track);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const storeDuration = usePlayerStore((s) => s.duration);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);

  const isCurrent = track?.id === String(podcast.id);
  const playable =
    podcast.status?.toUpperCase() === "COMPLETED" && Boolean(podcast.audioUrl);

  // Durée affichée : celle du player si piste courante, sinon métadonnée.
  const total = isCurrent && storeDuration ? storeDuration : podcast.duration ?? 0;
  const elapsed = isCurrent ? currentTime : 0;

  const trackData: Track = {
    id: String(podcast.id),
    title,
    source,
    audioUrl: podcast.audioUrl,
    artwork,
    href: `/podcasts/${podcast.id}`,
  };

  function onPlay() {
    if (isCurrent) toggle();
    else play(trackData);
  }

  function cycleRate() {
    const i = PLAYBACK_RATES.indexOf(
      playbackRate as (typeof PLAYBACK_RATES)[number],
    );
    setPlaybackRate(PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]);
  }

  if (!playable) {
    const failed = podcast.status?.toUpperCase() === "FAILED";
    return (
      <div className="rounded-[var(--radius)] border border-border bg-surface p-5 text-center shadow-elev-1">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-surface-2 text-text-faint">
          <Music className="size-6" />
        </div>
        <p className="text-sm font-semibold text-text">
          {failed ? "Échec de génération" : "Audio en cours de génération…"}
        </p>
        {podcast.errorMessage && (
          <p className="mt-1 text-xs text-text-dim">{podcast.errorMessage}</p>
        )}
      </div>
    );
  }

  const isActive = isCurrent && isPlaying;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-elev-1 lg:p-6">
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
        <Cover artwork={artwork} />

        <div className="min-w-0 flex-1 text-center lg:pt-1 lg:text-left">
          <h2
            className="font-display text-[20px] font-extrabold leading-tight tracking-[-0.015em]"
            aria-live="polite"
          >
            {title}
          </h2>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-text-dim lg:justify-start">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="size-[18px] rounded-full object-cover"
              />
            )}
            <span>{source}</span>
            {podcast.duration ? (
              <>
                <span aria-hidden>·</span>
                <span>{formatDuration(podcast.duration)}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Scrubber (actif uniquement si cette piste est la piste courante) */}
      <div className="mt-5">
        <Slider
          value={[Math.min(elapsed, total || 0)]}
          max={total || 1}
          step={1}
          disabled={!isCurrent}
          onValueChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v;
            if (isCurrent && typeof next === "number") requestSeek(next);
          }}
          aria-label="Position de lecture"
        />
        <div className="mt-1.5 flex justify-between text-xs tabular-nums text-text-dim">
          <span>{formatTime(elapsed)}</span>
          <span>{total ? formatTime(total) : "—"}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Reculer de 15 secondes"
          disabled={!isCurrent}
          onClick={() => requestSeek(Math.max(0, currentTime - 15))}
          className="grid size-11 place-items-center rounded-full text-text-dim transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-40"
        >
          <RotateCcw className="size-[22px]" />
        </button>

        <button
          type="button"
          onClick={onPlay}
          aria-label={
            isActive ? `Mettre en pause ${title}` : `Lire ${title}`
          }
          aria-pressed={isActive}
          className="grid size-14 place-items-center rounded-full bg-primary text-on-primary shadow-[0_4px_14px_rgba(252,116,58,0.4)] transition-transform active:scale-95"
        >
          {isActive ? (
            <Pause className="size-6" />
          ) : (
            <Play className="size-6 translate-x-px" />
          )}
        </button>

        <button
          type="button"
          aria-label="Avancer de 30 secondes"
          disabled={!isCurrent}
          onClick={() => requestSeek(currentTime + 30)}
          className="grid size-11 place-items-center rounded-full text-text-dim transition-colors hover:bg-surface-2 hover:text-text disabled:opacity-40"
        >
          <RotateCw className="size-[22px]" />
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={cycleRate}
          aria-label="Vitesse de lecture"
          className={cn(
            "min-w-[64px] rounded-[var(--radius)] border border-border bg-surface-2 px-3 py-1.5 text-[13px] font-bold tabular-nums text-text-dim transition-colors hover:text-text",
          )}
        >
          {playbackRate}×
        </button>
      </div>

      {!isCurrent && (
        <p className="mt-3 text-center text-xs text-text-dim">
          Appuyez sur lecture pour écouter ce podcast.
        </p>
      )}
    </div>
  );
}

function Cover({ artwork }: { artwork?: string }) {
  return (
    <div className="grid size-[200px] max-w-full shrink-0 place-items-center overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-brand-500 to-brand-600 text-white lg:size-[140px]">
      {artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artwork} alt="" className="size-full object-cover" />
      ) : (
        <Music className="size-16 lg:size-12" />
      )}
    </div>
  );
}

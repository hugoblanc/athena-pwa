"use client";

import { Music, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { PLAYBACK_RATES, formatTime, usePlayerStore } from "./player-store";

/**
 * Player audio SINGLETON — monté une fois dans l'AppShell, jamais démonté à la
 * navigation (lecture continue). Câblé à la MediaSession API (contrôles lockscreen).
 */
export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = usePlayerStore((s) => s.track);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const seekRequest = usePlayerStore((s) => s.seekRequest);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const toggle = usePlayerStore((s) => s.toggle);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setProgress = usePlayerStore((s) => s.setProgress);
  const requestSeek = usePlayerStore((s) => s.requestSeek);
  const clearSeek = usePlayerStore((s) => s.clearSeek);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);

  // Charge la piste courante
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.src !== track.audioUrl) audio.src = track.audioUrl;
  }, [track]);

  // Synchronise l'intention play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (isPlaying) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [isPlaying, track, setPlaying]);

  // Consomme les demandes de seek
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && seekRequest != null) {
      audio.currentTime = seekRequest;
      clearSeek();
    }
  }, [seekRequest, clearSeek]);

  // Applique la vitesse de lecture
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, track]);

  function cycleRate() {
    const i = PLAYBACK_RATES.indexOf(
      playbackRate as (typeof PLAYBACK_RATES)[number],
    );
    setPlaybackRate(PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length]);
  }

  // MediaSession (lockscreen / casque)
  useEffect(() => {
    if (!track || !("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.source,
      album: "Athena",
      artwork: track.artwork
        ? [{ src: track.artwork, sizes: "512x512", type: "image/png" }]
        : undefined,
    });
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("seekbackward", () =>
      requestSeek(Math.max(0, currentTime - 15)),
    );
    navigator.mediaSession.setActionHandler("seekforward", () =>
      requestSeek(currentTime + 30),
    );
  }, [track, currentTime, setPlaying, requestSeek]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  if (!track) return <audio ref={audioRef} preload="metadata" />;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setProgress(el.currentTime, el.duration || 0);
          if ("mediaSession" in navigator && el.duration) {
            try {
              navigator.mediaSession.setPositionState({
                duration: el.duration,
                position: el.currentTime,
                playbackRate: 1,
              });
            } catch {
              /* noop */
            }
          }
        }}
      />

      <div className="fixed bottom-[84px] left-2.5 right-2.5 z-30 lg:bottom-0 lg:left-[248px] lg:right-0">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-elev-2 lg:gap-[18px] lg:rounded-none lg:border-x-0 lg:border-b-0 lg:px-8 lg:py-3.5 lg:shadow-none">
          <PlayerCover artwork={track.artwork} />

          <Link
            href={track.href ?? "#"}
            className="min-w-0 flex-1"
            aria-label={`Lecture : ${track.title}`}
          >
            <div className="truncate text-[13px] font-bold">{track.title}</div>
            <div className="text-[11.5px] text-text-dim">
              {track.source} · {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div className="mt-[7px] h-[3px] overflow-hidden rounded-[2px] bg-surface-2 lg:hidden">
              <div
                className="h-full rounded-[2px] bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Link>

          <div className="hidden items-center gap-5 text-text-dim lg:flex">
            <button
              aria-label="Reculer de 15s"
              onClick={() => requestSeek(Math.max(0, currentTime - 15))}
            >
              <SkipBack className="size-5" />
            </button>
            <PlayButton isPlaying={isPlaying} onClick={toggle} />
            <button
              aria-label="Avancer de 30s"
              onClick={() => requestSeek(currentTime + 30)}
            >
              <SkipForward className="size-5" />
            </button>
            <button
              aria-label="Vitesse de lecture"
              onClick={cycleRate}
              className="min-w-11 rounded-md px-1.5 py-1 text-xs font-bold tabular-nums hover:bg-surface-2 hover:text-text"
            >
              {playbackRate}×
            </button>
          </div>

          <div className="lg:hidden">
            <PlayButton isPlaying={isPlaying} onClick={toggle} />
          </div>
        </div>
      </div>
    </>
  );
}

function PlayerCover({ artwork }: { artwork?: string }) {
  return (
    <div className="grid size-[46px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-600 text-white">
      {artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artwork}
          alt=""
          className="size-full rounded-[10px] object-cover"
        />
      ) : (
        <Music className="size-[22px]" />
      )}
    </div>
  );
}

function PlayButton({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={isPlaying ? "Pause" : "Lecture"}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white shadow-[0_4px_14px_rgba(252,116,58,0.4)]"
    >
      {isPlaying ? (
        <Pause className="size-5" />
      ) : (
        <Play className="size-5 translate-x-px" />
      )}
    </button>
  );
}

"use client";

import { create } from "zustand";
import { trackFeature, trackPlay } from "@/lib/analytics";

export interface Track {
  id: string;
  title: string;
  source: string;
  audioUrl: string;
  artwork?: string;
  /** lien interne ouvert au clic sur le player */
  href?: string;
  /** Attribution analytics (agrégée) : top contenus joués. Optionnel. */
  analytics?: { refType: "content" | "podcast"; refId: string };
}

interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  /** Vitesse de lecture (0.75×–2×). */
  playbackRate: number;
  /** Lance une piste (remplace la courante). */
  play: (track: Track) => void;
  toggle: () => void;
  setPlaying: (playing: boolean) => void;
  setProgress: (currentTime: number, duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  /** Demande de seek (consommée par l'AudioPlayer). */
  seekRequest: number | null;
  requestSeek: (time: number) => void;
  clearSeek: () => void;
}

/** Vitesses de lecture proposées. */
export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  seekRequest: null,
  play: (track) => {
    // Mesure agrégée : nombre de lectures + top contenus joués (si attribué).
    trackFeature("player_play");
    if (track.analytics) {
      trackPlay(track.analytics.refType, track.analytics.refId);
    }
    set({ track, isPlaying: true, currentTime: 0, duration: 0 });
  },
  toggle: () => set({ isPlaying: !get().isPlaying }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setProgress: (currentTime, duration) => set({ currentTime, duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  requestSeek: (seekRequest) => set({ seekRequest }),
  clearSeek: () => set({ seekRequest: null }),
}));

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

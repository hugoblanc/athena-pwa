"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FeedType } from "@/components/feed/feed-utils";

const STORAGE_KEY = "athena.feedPrefs";

export interface FeedPrefs {
  type: FeedType;
  ecoMode: boolean;
}

const DEFAULT_PREFS: FeedPrefs = { type: "all", ecoMode: false };

/** Lecture défensive depuis localStorage. Retourne les valeurs par défaut en cas d'échec. */
function readPrefs(): FeedPrefs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<FeedPrefs>;
    return {
      type:
        parsed.type === "video" || parsed.type === "article"
          ? parsed.type
          : "all",
      ecoMode: Boolean(parsed.ecoMode),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(prefs: FeedPrefs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage indisponible : silencieux */
  }
}

// Mini-store d'abonnés (même pattern que use-first-launch.ts).
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): FeedPrefs {
  return readPrefs();
}
/** Snapshot serveur neutre — pas de localStorage côté SSR. */
function getServerSnapshot(): FeedPrefs {
  return DEFAULT_PREFS;
}

export interface FeedPrefsState {
  prefs: FeedPrefs;
  setType: (type: FeedType) => void;
  setEcoMode: (enabled: boolean) => void;
}

/**
 * Préférences de fil persistées en localStorage.
 * Lit via `useSyncExternalStore` : snapshot serveur = valeurs par défaut
 * (anti-flash SSR), snapshot client lu après hydratation.
 */
export function useFeedPrefs(): FeedPrefsState {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setType = useCallback((type: FeedType) => {
    const current = readPrefs();
    writePrefs({ ...current, type });
    emit();
  }, []);

  const setEcoMode = useCallback((ecoMode: boolean) => {
    const current = readPrefs();
    writePrefs({ ...current, ecoMode });
    emit();
  }, []);

  return { prefs, setType, setEcoMode };
}

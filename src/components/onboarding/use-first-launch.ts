"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "athena.firstLaunchDone";

/** Lecture défensive du flag : storage indisponible (privé) → « déjà vu ». */
function readDone(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return true; // ne jamais boucler si le storage est inaccessible
  }
}

function writeDone(done: boolean): void {
  try {
    if (done) window.localStorage.setItem(STORAGE_KEY, "1");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage indisponible : silencieux (cf. spec §5 Error) */
  }
}

// Mini-store d'abonnés : permet à `useSyncExternalStore` de re-render après
// dismiss/replay, et de synchroniser plusieurs instances du hook (overlay +
// éventuel bouton « Revoir le tuto ») sans contexte global.
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Snapshot client : `true` si le tuto doit s'afficher (flag absent). */
function getSnapshot(): boolean {
  return !readDone();
}
/** Snapshot serveur : jamais affiché côté SSR (anti-flash, cf. spec §9). */
function getServerSnapshot(): boolean {
  return false;
}

export interface FirstLaunchState {
  /** `true` si le tuto doit s'afficher (flag absent + storage lisible). */
  shouldShow: boolean;
  /** Pose le flag et masque l'overlay (Passer / Commencer / Esc / backdrop). */
  dismiss: () => void;
  /** Retire le flag et ré-affiche l'overlay (« Revoir le tuto »). */
  replay: () => void;
}

/**
 * Gère le flag `FIRST_LAUNCH` (localStorage, source de vérité côté client).
 * Lit via `useSyncExternalStore` : snapshot serveur = `false` (overlay jamais
 * SSR ouvert → pas de flash d'hydratation, cf. spec §9), snapshot client lu
 * après hydratation. `dismiss`/`replay` notifient toutes les instances.
 */
export function useFirstLaunch(): FirstLaunchState {
  const shouldShow = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const dismiss = useCallback(() => {
    writeDone(true);
    emit();
  }, []);

  const replay = useCallback(() => {
    writeDone(false);
    emit();
  }, []);

  return { shouldShow, dismiss, replay };
}

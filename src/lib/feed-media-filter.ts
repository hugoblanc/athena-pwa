"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Clé localStorage des médias sélectionnés dans le fil (filtre par sources). */
const STORAGE_KEY = "athena.feedFilterMediaKeys";

/** Lecture défensive : liste de clés média, vide si absente/illisible. */
function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : [];
  } catch {
    return [];
  }
}

function write(keys: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {
    /* storage indisponible : silencieux */
  }
}

// Mini-store d'abonnés (même pattern que feed-prefs.ts) : snapshot mémoïsé,
// invalidé à chaque emit()/event storage pour garder une référence stable.
const listeners = new Set<() => void>();
let snapshot: string[] | undefined;
const EMPTY: string[] = [];

function emit() {
  snapshot = undefined;
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = () => {
    snapshot = undefined;
    cb();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): string[] {
  if (snapshot === undefined) snapshot = read();
  return snapshot;
}
/** Snapshot serveur neutre — pas de localStorage en SSR (anti-flash hydratation). */
function getServerSnapshot(): string[] {
  return EMPTY;
}

export interface FeedMediaFilterState {
  /** Clés média sélectionnées (vide = aucun filtre par source). */
  selected: string[];
  /** Bascule une clé média dans la sélection. */
  toggle: (key: string) => void;
  /** Remplace toute la sélection. */
  setAll: (keys: string[]) => void;
  /** Vide la sélection. */
  clear: () => void;
}

/**
 * Sélection de médias persistée pour le filtre du fil.
 * Lit via `useSyncExternalStore` : snapshot serveur = vide (anti-flash SSR),
 * snapshot client lu après hydratation.
 */
export function useFeedMediaFilter(): FeedMediaFilterState {
  const selected = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggle = useCallback((key: string) => {
    const current = read();
    write(
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
    emit();
  }, []);

  const setAll = useCallback((keys: string[]) => {
    write(keys);
    emit();
  }, []);

  const clear = useCallback(() => {
    write([]);
    emit();
  }, []);

  return { selected, toggle, setAll, clear };
}

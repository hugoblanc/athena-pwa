"use client";

import { useSyncExternalStore } from "react";
import { readArticles, subscribe, markRead } from "@/lib/read-articles";

const EMPTY: Set<string> = new Set();

/**
 * Hook client pour savoir si un article a été lu et le marquer comme lu.
 * Hydration-safe : snapshot serveur = Set vide (aucun article lu).
 */
export function useReadArticles() {
  const read = useSyncExternalStore(
    subscribe,
    () => readArticles(),
    () => EMPTY,
  );

  return {
    isRead: (href: string) => read.has(href),
    markRead,
  };
}

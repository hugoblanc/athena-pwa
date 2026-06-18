"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  markRead,
  subscribe,
} from "@/lib/read-articles";

/**
 * Hook client pour savoir si un article a été lu et le marquer comme lu.
 * Hydration-safe : snapshot serveur = Set vide (aucun article lu).
 * Le snapshot est mémorisé côté store (référence stable) pour éviter la
 * boucle de re-rendus de useSyncExternalStore.
 */
export function useReadArticles() {
  const read = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    isRead: (href: string) => read.has(href),
    markRead,
  };
}

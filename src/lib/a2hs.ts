"use client";

/**
 * Store GLOBAL de l'invite d'installation PWA (`beforeinstallprompt`).
 *
 * L'event ne se déclenche qu'UNE fois par chargement de page et est capturé là
 * où il arrive. Sans store global, naviguer (ex. /share → /installer) perdrait
 * l'invite → plus de bouton « 1-tap ». On la capture donc une fois au niveau
 * racine et on la conserve en mémoire module, partagée par toutes les pages.
 */

import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let initialized = false;
const subscribers = new Set<() => void>();

function emit(): void {
  subscribers.forEach((s) => s());
}

/** Enregistre (une seule fois) la capture globale. À appeler tôt, au root. */
export function initA2HS(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit();
  });
}

function subscribe(cb: () => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

const getSnapshot = (): boolean => deferred !== null;
const getServerSnapshot = (): boolean => false;

/** `true` si une invite d'installation native est disponible (Android/desktop Chrome). */
export function useCanInstall(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Déclenche l'invite native. Retourne l'issue, ou `"unavailable"` si aucune
 * invite n'est disponible (iOS, déjà installée, navigateur non compatible).
 */
export async function promptInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  if (!deferred) return "unavailable";
  const evt = deferred;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  deferred = null;
  emit();
  return outcome;
}

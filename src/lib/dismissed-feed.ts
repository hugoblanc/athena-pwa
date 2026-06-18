import { useSyncExternalStore } from "react";

const STORAGE_KEY = "athena:dismissed-feed";

export function readDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function persistDismissed(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota / mode privé — on ignore silencieusement */
  }
}

// ── Store externe minimal pour synchroniser l'état « masqué » (localStorage)
// sans setState-dans-un-effet. Hydration-safe via le snapshot serveur (= Set vide).
const listeners = new Set<() => void>();

// useSyncExternalStore exige une référence STABLE tant que rien ne change,
// sinon boucle de re-rendus infinie. On mémorise le snapshot et on l'invalide
// à chaque emit() / event storage.
let snapshot: Set<string> | undefined;
const SERVER_SNAPSHOT: Set<string> = new Set();

export function getSnapshot(): Set<string> {
  if (snapshot === undefined) snapshot = readDismissed();
  return snapshot;
}

export function getServerSnapshot(): Set<string> {
  return SERVER_SNAPSHOT;
}

export function emit() {
  snapshot = undefined;
  for (const l of listeners) l();
}

export function subscribe(cb: () => void) {
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

/**
 * Hook React pour accéder et modifier la liste des contenus masqués.
 * Hydration-safe : snapshot serveur = Set vide.
 */
export function useDismissedFeed(): {
  dismissed: Set<string>;
  dismiss: (contentId: string) => void;
  undoDismiss: (contentId: string) => void;
} {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function dismiss(contentId: string) {
    const next = readDismissed();
    next.add(contentId);
    persistDismissed(next);
    emit();
  }

  function undoDismiss(contentId: string) {
    const next = readDismissed();
    next.delete(contentId);
    persistDismissed(next);
    emit();
  }

  return { dismissed, dismiss, undoDismiss };
}

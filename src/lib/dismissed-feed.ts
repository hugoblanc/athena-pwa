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

export function emit() {
  for (const l of listeners) l();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", cb);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", cb);
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
    readDismissed,
    () => new Set<string>(), // snapshot serveur : rien de masqué avant hydratation
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

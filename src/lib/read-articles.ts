const STORAGE_KEY = "athena:read-articles";

/** Lit le Set des hrefs lus depuis localStorage. */
export function readArticles(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistArticles(hrefs: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...hrefs]));
  } catch {
    /* quota / mode privé — effet purement cosmétique, on ignore */
  }
}

// ── Store externe minimal — synchronise l'état « déjà lu » (localStorage)
// entre composants et onglets sans setState-dans-un-effet.
const listeners = new Set<() => void>();

export function emit() {
  for (const l of listeners) l();
}

export function subscribe(cb: () => void): () => void {
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

/** Marque un href comme lu et notifie les abonnés. */
export function markRead(href: string) {
  const current = readArticles();
  if (current.has(href)) return; // déjà marqué — évite une écriture inutile
  current.add(href);
  persistArticles(current);
  emit();
}

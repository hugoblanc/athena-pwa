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

// useSyncExternalStore exige une référence STABLE tant que rien ne change,
// sinon il re-rend en boucle. On mémorise donc le snapshot et on l'invalide
// à chaque emit() / event storage.
let snapshot: Set<string> | undefined;
const SERVER_SNAPSHOT: Set<string> = new Set();

/** Snapshot client mémorisé (recalculé après chaque emit / storage). */
export function getSnapshot(): Set<string> {
  if (snapshot === undefined) snapshot = readArticles();
  return snapshot;
}

/** Snapshot serveur stable — aucun article lu avant hydratation. */
export function getServerSnapshot(): Set<string> {
  return SERVER_SNAPSHOT;
}

export function emit() {
  snapshot = undefined;
  for (const l of listeners) l();
}

export function subscribe(cb: () => void): () => void {
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

/** Marque un href comme lu et notifie les abonnés. */
export function markRead(href: string) {
  const current = readArticles();
  if (current.has(href)) return; // déjà marqué — évite une écriture inutile
  current.add(href);
  persistArticles(current);
  emit();
}

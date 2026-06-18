/**
 * Liste de lecture (bookmarks) — persistance localStorage uniquement (v1).
 *
 * Clé : "athena:reading-list"
 * Cap : 200 entrées (FIFO sur savedAt).
 *
 * Pattern identique à clap-button.tsx : store externe minimal pour
 * useSyncExternalStore côté client, window.storage pour la synchro multi-onglets.
 */

export interface SavedArticle {
  id: number;
  contentId: string;
  mediaKey: string;
  title: string;
  publishedAt: string;
  imageUrl?: string;
  mediaTitle: string;
  mediaType: "YOUTUBE" | "WORDPRESS";
  savedAt: string;
}

const STORAGE_KEY = "athena:reading-list";
const MAX_ENTRIES = 200;

// ── Persistance ──────────────────────────────────────────────────────────────

function readList(): SavedArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedArticle[];
  } catch {
    return [];
  }
}

function persistList(items: SavedArticle[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode — on ignore silencieusement */
  }
}

// ── Store externe ─────────────────────────────────────────────────────────────

const listeners = new Set<() => void>();

export function emit(): void {
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

// ── API publique ──────────────────────────────────────────────────────────────

/** Retourne la liste complète triée par savedAt desc. */
export function getReadingList(): SavedArticle[] {
  return readList().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

/** Enregistre un article. Dépasse MAX_ENTRIES → supprime les plus anciens. */
export function saveArticle(article: SavedArticle): void {
  try {
    const list = readList().filter((a) => a.id !== article.id);
    list.push({ ...article, savedAt: new Date().toISOString() });
    // Cap : garder les MAX_ENTRIES les plus récents
    const capped = list
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, MAX_ENTRIES);
    persistList(capped);
    emit();
  } catch {
    /* noop */
  }
}

/** Retire un article de la liste. */
export function removeArticle(id: number): void {
  try {
    const list = readList().filter((a) => a.id !== id);
    persistList(list);
    emit();
  } catch {
    /* noop */
  }
}

/** Indique si un article est dans la liste. SSR-safe (retourne false). */
export function isArticleSaved(id: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return readList().some((a) => a.id === id);
  } catch {
    return false;
  }
}

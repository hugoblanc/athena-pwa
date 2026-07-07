/**
 * Préférence de taille du texte de lecture (#124), persistée localement.
 * Le multiplicateur est exposé au CSS via `--reader-font-scale` (cf. `.prose`
 * dans globals.css) et piloté par `<ReaderScale>`. Store minimal compatible
 * `useSyncExternalStore`, dans l'esprit de `lib/reading-list`.
 */
const STORAGE_KEY = "athena:reader-font-scale";

/** Échelles disponibles = multiplicateur de la taille de base du corps d'article. */
export const READER_FONT_SCALES: readonly number[] = [0.9, 1, 1.15, 1.3, 1.5];
const DEFAULT_SCALE = 1;

let scale = DEFAULT_SCALE;
let loaded = false;
const listeners = new Set<() => void>();

/** Ramène une valeur arbitraire sur l'échelle autorisée la plus proche. */
function nearestScale(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SCALE;
  return READER_FONT_SCALES.reduce(
    (best, s) => (Math.abs(s - value) < Math.abs(best - value) ? s : best),
    READER_FONT_SCALES[0],
  );
}

/** Charge la préférence depuis localStorage au premier accès (client seulement). */
function ensureLoaded(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw != null) scale = nearestScale(Number.parseFloat(raw));
  } catch {
    /* localStorage indisponible (mode privé…) : on garde la valeur par défaut. */
  }
}

/** Échelle courante (client). */
export function getScale(): number {
  ensureLoaded();
  return scale;
}

/** Snapshot serveur : échelle par défaut avant hydratation. */
export function getServerScale(): number {
  return DEFAULT_SCALE;
}

/** Fixe l'échelle (ramenée sur un cran valide), persiste et notifie. */
export function setScale(next: number): void {
  const clamped = nearestScale(next);
  if (clamped === scale && loaded) return;
  loaded = true;
  scale = clamped;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(scale));
  } catch {
    /* ignore */
  }
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

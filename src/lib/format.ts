/** Helpers de formatage partagés (dates FR via Intl natif, durées). */

const dateFmt = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Date FR longue : « 16 juin 2026 ». */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dateFmt.format(d);
}

/** Date relative simple : « il y a 2 h », « hier », sinon date longue. */
export function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "à l'instant";
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return formatDate(iso);
}

/** Durée humanisée à partir de secondes : « 1 h 12 », « 24 min ». */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return "";
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest}` : `${h} h`;
}

/**
 * Drapeau emoji pour un code pays ISO 3166-1 alpha-2 (ex. "FR" → "🇫🇷").
 * Renvoie `null` si le code est invalide ou absent.
 */
export function countryFlag(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  const upper = code.toUpperCase();
  // Vérifie que ce sont bien deux lettres A-Z
  if (!/^[A-Z]{2}$/.test(upper)) return null;
  return String.fromCodePoint(
    ...upper.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/**
 * Libellé localisé d'un code pays (ex. "FR", locale "fr" → "France").
 * Renvoie `""` si le code est invalide ou si l'environnement ne supporte pas Intl.DisplayNames.
 */
export function countryLabel(
  code: string | null | undefined,
  locale = "fr",
): string {
  if (!code || code.length !== 2) return "";
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code.toUpperCase()) ?? "";
  } catch {
    return "";
  }
}

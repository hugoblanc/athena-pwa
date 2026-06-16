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

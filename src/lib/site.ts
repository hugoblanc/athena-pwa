/**
 * Origine canonique de la PWA (pour les liens de partage et `metadataBase`).
 *
 * Distincte de `NEXT_PUBLIC_API_URL` (l'API NestJS) : ici c'est le domaine du
 * site Next lui-même. Sans elle, les `ShareButton` partageaient des chemins
 * RELATIFS (`/share/...`) inutilisables hors du navigateur, et les images OG
 * relatives ne se résolvaient pas. Variable de build (`NEXT_PUBLIC_*`).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/** `URL` réutilisable pour `metadataBase` (résolution des OG images relatives). */
export const SITE_ORIGIN = new URL(SITE_URL);

/** Canal d'origine d'un partage, encodé en `?ref` pour l'attribution. */
export type ShareRef =
  | "app" // partagé depuis l'app (bouton natif)
  | "landing" // re-partagé depuis une page d'atterrissage /share
  | "whatsapp"
  | "telegram"
  | "x"
  | "mailto"
  | "copy";

/** Type de ressource partagée (aligné avec le `refType` analytics). */
export type ShareRefType = "content" | "podcast" | "law" | "qa";

/**
 * Chemins canoniques de partage par type de ressource. Source unique : si la
 * route change, on la corrige ici et tous les call-sites suivent.
 */
export const sharePath = {
  /** Route SSR dédiée avec carte OpenGraph (`/share/[key]/[contentId]`). */
  content: (key: string, contentId: string | number) =>
    `/share/${key}/${contentId}`,
  podcast: (id: string | number) => `/podcasts/${id}`,
  law: (numero: string | number) => `/propositions/${numero}`,
} as const;

/**
 * Construit une URL ABSOLUE à partir d'un chemin (avec ou sans `/` initial).
 * À utiliser pour toute URL qui quitte l'app (partage, canonical, OG).
 */
export function absoluteUrl(path: string): string {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

/**
 * URL de partage ABSOLUE + `?ref` attribuable.
 * @param path chemin canonique (typiquement via `sharePath.*`)
 * @param ref  canal d'origine (défaut `app`)
 */
export function buildShareUrl(path: string, ref: ShareRef = "app"): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL);
  url.searchParams.set("ref", ref);
  return url.toString();
}

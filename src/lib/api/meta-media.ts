import { apiGet } from "./client";
import { CACHE } from "./config";
import type { ListMetaMedia } from "./types";

/**
 * Liste des médias libres (groupés). `GET /list-meta-media`
 * Public → idéal en Server Component (SSR/ISR) pour le SEO.
 */
export function getMetaMedias(): Promise<ListMetaMedia[]> {
  return apiGet<ListMetaMedia[]>("/list-meta-media", CACHE.list);
}

import { apiGet } from "./client";
import { CACHE } from "./config";
import { fromMetaPage, type MetaPage, type UnifiedPage } from "./pagination";
import type { Podcast } from "./types";

/** Liste des podcasts paginée. `GET /podcast/list` */
export async function listPodcasts(params: {
  page?: number;
  size?: number;
  terms?: string;
}): Promise<UnifiedPage<Podcast>> {
  const res = await apiGet<MetaPage<Podcast>>("/podcast/list", {
    query: { page: params.page, size: params.size, terms: params.terms },
    ...CACHE.list,
  });
  return fromMetaPage(res);
}

/** Détail d'un podcast (avec son `content`). `GET /podcast/:id` */
export function getPodcast(id: number | string): Promise<Podcast> {
  return apiGet<Podcast>(`/podcast/${id}`, CACHE.detail);
}

/** Podcast suivant. `GET /podcast/:id/next` */
export function getNextPodcast(id: number | string): Promise<Podcast> {
  return apiGet<Podcast>(`/podcast/${id}/next`, CACHE.detail);
}

/** Podcast précédent. `GET /podcast/:id/previous` */
export function getPreviousPodcast(id: number | string): Promise<Podcast> {
  return apiGet<Podcast>(`/podcast/${id}/previous`, CACHE.detail);
}

/** Podcast lié à un contenu. `GET /podcast/content/:contentId` */
export function getPodcastByContent(
  contentId: number | string,
): Promise<Podcast | null> {
  return apiGet<Podcast | null>(`/podcast/content/${contentId}`, CACHE.detail);
}

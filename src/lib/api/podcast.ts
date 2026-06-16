import { apiGet } from "./client";
import { CACHE } from "./config";
import { fromMetaPage, type MetaPage, type UnifiedPage } from "./pagination";
import { decodeEntities } from "../text";
import type { Podcast } from "./types";

/** Décode les entités HTML du titre du contenu lié (titres WordPress). */
function decodePodcast<T extends Podcast | null>(p: T): T {
  if (p?.content?.title) {
    return {
      ...p,
      content: { ...p.content, title: decodeEntities(p.content.title) },
    };
  }
  return p;
}

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
  const page = fromMetaPage(res);
  return { ...page, items: page.items.map(decodePodcast) };
}

/** Détail d'un podcast (avec son `content`). `GET /podcast/:id` */
export async function getPodcast(id: number | string): Promise<Podcast> {
  return decodePodcast(await apiGet<Podcast>(`/podcast/${id}`, CACHE.detail));
}

/** Podcast suivant. `GET /podcast/:id/next` */
export async function getNextPodcast(id: number | string): Promise<Podcast> {
  return decodePodcast(
    await apiGet<Podcast>(`/podcast/${id}/next`, CACHE.detail),
  );
}

/** Podcast précédent. `GET /podcast/:id/previous` */
export async function getPreviousPodcast(id: number | string): Promise<Podcast> {
  return decodePodcast(
    await apiGet<Podcast>(`/podcast/${id}/previous`, CACHE.detail),
  );
}

/** Podcast lié à un contenu. `GET /podcast/content/:contentId` */
export async function getPodcastByContent(
  contentId: number | string,
): Promise<Podcast | null> {
  return decodePodcast(
    await apiGet<Podcast | null>(
      `/podcast/content/${contentId}`,
      CACHE.detail,
    ),
  );
}

import { apiGet } from "./client";
import { CACHE } from "./config";
import {
  fromContentPage,
  type ContentPage,
  type UnifiedPage,
} from "./pagination";
import type {
  Content,
  ContentLite,
  ShareableContentResponse,
} from "./types";

/** Feed agrégé paginé. `GET /content/last` */
export async function getLastContent(params: {
  page: number;
  size: number;
  terms?: string;
  mediaKeys?: string[];
}): Promise<UnifiedPage<ContentLite>> {
  const res = await apiGet<ContentPage<ContentLite>>("/content/last", {
    query: {
      page: params.page,
      size: params.size,
      terms: params.terms,
      mediaKeys: params.mediaKeys,
    },
    ...CACHE.list,
  });
  return fromContentPage(res);
}

/** Détail d'un contenu. `GET /content/:id` */
export function getContent(id: number | string): Promise<Content> {
  return apiGet<Content>(`/content/${id}`, CACHE.detail);
}

/**
 * Contenus d'un média, paginés via l'API Athena (et NON le site WordPress —
 * corrige la dette CORS de l'audit). `GET /content/mediakey/:key/page/:page`
 */
export async function getContentByMediaKey(
  mediaKey: string,
  page: number,
): Promise<UnifiedPage<Content>> {
  const res = await apiGet<ContentPage<Content>>(
    `/content/mediakey/${mediaKey}/page/${page}`,
    CACHE.list,
  );
  return fromContentPage(res);
}

/** Métadonnées de partage (OG). `GET /content/get-shareable-content/:key/:contentId` */
export function getShareableContent(
  key: string,
  contentId: string,
): Promise<ShareableContentResponse> {
  return apiGet(`/content/get-shareable-content/${key}/${contentId}`, CACHE.detail);
}

/** URL audio (TTS) d'un contenu. `GET /content/get-audio-content-url-by-id/:id` */
export function getAudioContentUrl(
  id: number | string,
): Promise<ShareableContentResponse> {
  return apiGet(`/content/get-audio-content-url-by-id/${id}`, CACHE.detail);
}

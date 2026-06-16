import { apiGet } from "./client";
import { CACHE } from "./config";
import {
  fromContentPage,
  type ContentPage,
  type UnifiedPage,
} from "./pagination";
import { decodeEntities } from "../text";
import type {
  Content,
  ContentLite,
  ShareableContentResponse,
} from "./types";

/** Décode les entités HTML du titre (titres WordPress : `l&rsquo;…`). */
function decodeTitle<T extends { title: string }>(c: T): T {
  return { ...c, title: decodeEntities(c.title) };
}

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
  const page = fromContentPage(res);
  return { ...page, items: page.items.map(decodeTitle) };
}

/** Détail d'un contenu par son id INTERNE (clé primaire). `GET /content/:id` */
export async function getContent(id: number): Promise<Content> {
  return decodeTitle(await apiGet<Content>(`/content/${id}`, CACHE.detail));
}

/**
 * Résout l'id interne d'un contenu depuis (clé média, `contentId` source).
 * `/content/:id` attend la clé primaire numérique, PAS le `contentId` source
 * (non numérique côté YouTube, et un `contentId` WordPress numérique tombe sur
 * une mauvaise/aucune ligne) → on passe par cet endpoint de résolution.
 * `GET /content/get-id-from-content-id-and-media-key/:key/:contentId`
 */
export async function resolveContentId(
  key: string,
  contentId: string,
): Promise<number> {
  const res = await apiGet<{ id: number }>(
    `/content/get-id-from-content-id-and-media-key/${key}/${contentId}`,
    CACHE.detail,
  );
  return res.id;
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
  const unified = fromContentPage(res);
  return { ...unified, items: unified.items.map(decodeTitle) };
}

/** Métadonnées de partage (OG). `GET /content/get-shareable-content/:key/:contentId` */
export async function getShareableContent(
  key: string,
  contentId: string,
): Promise<ShareableContentResponse> {
  const res = await apiGet<ShareableContentResponse>(
    `/content/get-shareable-content/${key}/${contentId}`,
    CACHE.detail,
  );
  return {
    ...res,
    title: decodeEntities(res.title),
    mediaTitle: res.mediaTitle ? decodeEntities(res.mediaTitle) : res.mediaTitle,
  };
}

/** URL audio (TTS) d'un contenu. `GET /content/get-audio-content-url-by-id/:id` */
export function getAudioContentUrl(
  id: number | string,
): Promise<ShareableContentResponse> {
  return apiGet(`/content/get-audio-content-url-by-id/${id}`, CACHE.detail);
}

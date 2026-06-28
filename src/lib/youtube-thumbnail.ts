/**
 * Le backend ne stocke que la miniature YouTube « medium » (`mqdefault.jpg`,
 * 320×180). Étirée sur un grand visuel (hero du feed), elle pixellise. YouTube
 * expose des variantes plus grandes au même chemin : `maxresdefault.jpg`
 * (1280×720), disponible pour la plupart des vidéos récentes.
 *
 * On bascule donc vers la variante haute résolution pour les grands rendus, avec
 * un fallback vers l'URL d'origine (cf. `<Thumbnail>`) car `maxresdefault` peut
 * renvoyer un 404 sur de vieilles vidéos uploadées en basse définition.
 */

// https://i.ytimg.com/vi/{VIDEO_ID}/mqdefault.jpg  (le nom de fichier varie)
const YT_THUMB_RE = /^(https?:\/\/i\.ytimg\.com\/vi\/[^/]+\/)[\w-]+\.jpg(\?.*)?$/;

/**
 * Renvoie une variante haute résolution d'une miniature YouTube si l'URL en est
 * une, sinon l'URL inchangée (articles WordPress, etc.).
 */
export function hiResYoutubeThumbnail(url: string): string {
  const m = url.match(YT_THUMB_RE);
  return m ? `${m[1]}maxresdefault.jpg${m[2] ?? ""}` : url;
}

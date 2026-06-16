import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Content } from "@/lib/api/types";
import { sanitizeHtml } from "@/lib/sanitize";

/** Extrait l'identifiant vidéo d'une URL YouTube (watch / youtu.be / embed). */
function extractYoutubeId(url: string | undefined): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/**
 * Corps éditorial d'un contenu (Server Component).
 * - WORDPRESS → HTML sanitizé serveur, rendu dans le conteneur `.prose` global.
 * - YOUTUBE → iframe d'embed (fallback lien si l'id est introuvable).
 * - Vide → message discret + lien vers la source.
 */
export function ArticleBody({
  content,
  originalUrl,
}: {
  content: Content;
  /** URL d'origine (issue de getShareableContent) pour le fallback. */
  originalUrl?: string;
}) {
  const sourceUrl = originalUrl ?? content.metaMedia?.title;

  if (content.contentType === "YOUTUBE") {
    const videoId = extractYoutubeId(originalUrl);
    if (videoId) {
      return (
        <div className="prose">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={content.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="aspect-video w-full rounded-[var(--radius)] border-0"
          />
          {content.description ? (
            <div
              // HTML sanitizé côté serveur (allowlist stricte, cf. lib/sanitize)
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.description) }}
            />
          ) : null}
        </div>
      );
    }
    // Pas d'id exploitable → lien vers la vidéo d'origine.
    return <SourceFallback url={originalUrl} />;
  }

  const html = content.description?.trim();
  if (!html) {
    return <SourceFallback url={sourceUrl} />;
  }

  return (
    <div
      className="prose"
      // HTML sanitizé côté serveur avant injection (allowlist stricte, cf. lib/sanitize)
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

/** Bloc de repli quand le corps est vide : message + lien vers le média. */
function SourceFallback({ url }: { url?: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface-2 p-6 text-center">
      <p className="text-sm text-text-dim">
        Le contenu complet est disponible sur le site du média.
      </p>
      {url ? (
        <Button
          variant="secondary"
          className="mt-4"
          nativeButton={false}
          render={
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
              Lire sur le site du média
            </a>
          }
        />
      ) : null}
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/content/article-body";
import { BookmarkButton } from "@/components/content/bookmark-button";
import { ListenButton } from "@/components/content/listen-button";
import { ReadingProgressBar } from "@/components/content/reading-progress-bar";
import { NotifyOptInSheet } from "@/components/notif/notify-opt-in-sheet";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { Tag } from "@/components/ui/tag";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/config";
import {
  getContent,
  getShareableContent,
  resolveContentId,
} from "@/lib/api/content";
import type { Content, ShareableContentResponse } from "@/lib/api/types";
import { formatDate, readingTimeFromText } from "@/lib/format";
import { mediaLogoSrc } from "@/lib/media";
import { buildShareUrl, sharePath } from "@/lib/site";

interface PageParams {
  key: string;
  id: string;
}

/** Résout le contenu depuis (clé média, `contentId` de l'URL) : d'abord l'id
 *  interne, puis le détail. 404 → notFound. */
async function loadContent(key: string, contentId: string): Promise<Content> {
  try {
    const internalId = await resolveContentId(key, contentId);
    return await getContent(internalId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

/** Métadonnées de partage (OG). Tolérant : null si l'endpoint échoue. */
async function loadShareable(
  key: string,
  contentId: string,
): Promise<ShareableContentResponse | null> {
  try {
    return await getShareableContent(key, contentId);
  } catch {
    return null;
  }
}


export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { key, id } = await params;
  const share = await loadShareable(key, id);
  if (!share) return { title: "Contenu — Athena" };

  const url = `/content/${key}/${id}`;
  // OG image brandée servie par l'API (carte 1200×630 Athena + média source),
  // partagée avec la landing /share — voir le commentaire là-bas.
  const ogImage = `${API_BASE_URL}/content/${encodeURIComponent(
    key,
  )}/${encodeURIComponent(id)}/og.png`;
  return {
    title: share.title,
    openGraph: {
      title: share.title,
      type: "article",
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: share.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: share.title,
      images: [ogImage],
    },
  };
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { key, id } = await params;

  // Fetchs serveur parallélisés (memoïsés avec generateMetadata).
  const [content, share] = await Promise.all([
    loadContent(key, id),
    loadShareable(key, id),
  ]);

  const isVideo = content.contentType === "YOUTUBE";
  const sourceTitle = content.metaMedia?.title ?? "Média libre";
  const kicker = `${isVideo ? "Vidéo" : "Article"} · ${sourceTitle}`;
  const heroImage = share?.image?.url ?? content.image?.url;
  const originalUrl = share?.originalUrl;
  const minutes = readingTimeFromText(content.plainText);
  const href = `/content/${key}/${id}`;
  const shareUrl = buildShareUrl(sharePath.content(key, id));

  return (
    <article className="mx-auto max-w-[640px] px-5 pt-4 pb-16 lg:pt-6">
      <ReadingProgressBar />

      {/* En-tête éditorial */}
      <header className="mb-5">
        <Tag orange>{kicker}</Tag>

        <h1 className="mt-3 font-display text-[22px] font-extrabold leading-[1.18] tracking-[-0.015em] lg:text-[28px] lg:tracking-[-0.02em]">
          {content.title}
        </h1>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-text-dim">
          <span className="flex items-center gap-2">
            <Avatar
              src={mediaLogoSrc(content.metaMedia?.logo)}
              name={sourceTitle}
              size={22}
              square
            />
            <span className="font-medium text-text">{sourceTitle}</span>
          </span>
          {content.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={content.publishedAt}>
                {formatDate(content.publishedAt)}
              </time>
            </>
          )}
          {minutes && (
            <>
              <span aria-hidden>·</span>
              <span>{minutes}</span>
            </>
          )}
        </div>
      </header>

      {/* Image hero (pour les articles ; la vidéo a son propre embed) */}
      {!isVideo && heroImage && (
        <div className="mb-5 overflow-hidden rounded-[var(--radius)] border border-border bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={content.title}
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      {/* Barre d'actions — îlots clients */}
      <div className="mb-6 flex flex-wrap items-center gap-2.5">
        <ListenButton
          track={{
            // id INTERNE (pas le contentId source) : l'endpoint audio TTS
            // attend la clé primaire numérique.
            id: String(content.id),
            title: content.title,
            source: sourceTitle,
            artwork: heroImage,
            href,
          }}
        />
        <ShareButton
          variant="button"
          data={{ title: content.title, url: shareUrl }}
          tracking={{ refType: "content", refId: id }}
        />
        <BookmarkButton
          variant="icon"
          article={{
            id: content.id,
            contentId: content.contentId,
            mediaKey: content.metaMedia?.key ?? key,
            title: content.title,
            publishedAt: content.publishedAt,
            imageUrl: heroImage,
            mediaTitle: sourceTitle,
            mediaType: content.contentType,
          }}
        />
        {originalUrl && (
          <Button
            variant="ghost"
            nativeButton={false}
            render={
              <a href={originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Source
              </a>
            }
          />
        )}
      </div>

      {/* Corps éditorial (Server Component) */}
      <ArticleBody content={content} originalUrl={originalUrl} />

      {/* Pied : valorisation du média source */}
      {originalUrl && (
        <footer className="mt-10 border-t border-border pt-6 text-sm text-text-dim">
          Contenu publié par{" "}
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2"
          >
            {sourceTitle}
          </a>
          . Soutenez les médias libres en consultant la source originale.
        </footer>
      )}

      {/* Opt-in notif après ~12 s de lecture (non bloquant). */}
      <NotifyOptInSheet mediaTitle={sourceTitle} mediaKey={content.metaMedia?.key ?? key} />
    </article>
  );
}

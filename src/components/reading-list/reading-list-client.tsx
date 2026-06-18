"use client";

import { Bookmark, Play, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Tag } from "@/components/ui/tag";
import { formatRelative } from "@/lib/format";
import {
  getReadingList,
  removeArticle,
  subscribe,
  type SavedArticle,
} from "@/lib/reading-list";

/** Récupère la liste triée (snapshot client). */
function getSnapshot() {
  return getReadingList();
}

/** Snapshot SSR : tableau vide (pas de localStorage côté serveur). */
function getServerSnapshot(): SavedArticle[] {
  return [];
}

/**
 * Page liste de lecture — 100 % client.
 * Utilise useSyncExternalStore pour rester synchronisé avec les autres onglets.
 */
export function ReadingListClient() {
  const t = useTranslations("readingList");

  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 pb-16 lg:pt-6">
      <h1 className="mb-5 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        {t("title")}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="grid gap-3">
          {items.map((article) => (
            <ReadingListCard
              key={article.id}
              article={article}
              removeLabel={t("remove")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReadingListCard({
  article,
  removeLabel,
}: {
  article: SavedArticle;
  removeLabel: string;
}) {
  const isVideo = article.mediaType === "YOUTUBE";
  const href = `/content/${article.mediaKey}/${article.contentId}`;
  const tag = `${isVideo ? "Vidéo" : "Article"} · ${article.mediaTitle}`;

  return (
    <div className="relative group">
      <Link
        href={href}
        className="flex gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary"
      >
        {/* Vignette */}
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-gradient-to-br from-surface-2 to-border">
          {article.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          )}
          {isVideo && (
            <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
              <Play className="size-6" />
            </span>
          )}
        </div>

        {/* Contenu texte */}
        <div className="min-w-0 flex-1 pr-8">
          <Tag>{tag}</Tag>
          <h3 className="mt-[7px] mb-1.5 line-clamp-2 font-display text-[15.5px] font-bold leading-tight tracking-[-0.01em]">
            {article.title}
          </h3>
          <div className="text-xs text-text-dim">
            {formatRelative(article.publishedAt)}
          </div>
        </div>
      </Link>

      {/* Bouton retirer */}
      <button
        type="button"
        onClick={() => removeArticle(article.id)}
        aria-label={removeLabel}
        className="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-[var(--radius-sm)] border border-border/60 bg-surface/85 text-text-dim backdrop-blur-sm transition-colors duration-150 hover:border-danger/50 hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}

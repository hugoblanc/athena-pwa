"use client";

import { Clock, Play } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { useReadArticles } from "@/lib/use-read-articles";

export interface ContentCardData {
  href: string;
  tag: string;
  title: string;
  meta: string;
  /** image de vignette (optionnelle) */
  image?: string;
  isVideo?: boolean;
  /** Temps de lecture pré-calculé (ex : « 4 min de lecture »). Absent si wordCount
   *  non exposé par le backend ou si c'est une vidéo. */
  readingTime?: string;
}

/** Carte de contenu en liste (feed). */
export function ContentCard({
  data,
  actions,
  className,
}: {
  data: ContentCardData;
  /** Slot optionnel rendu en overlay coin sup. droit (ex : BookmarkButton). */
  actions?: ReactNode;
  className?: string;
}) {
  const { isRead, markRead } = useReadArticles();
  const read = isRead(data.href);

  return (
    <div className={cn("group relative", className)}>
      <Link
        href={data.href}
        onClick={() => markRead(data.href)}
        className={cn(
          "flex gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color,opacity] duration-200 hover:-translate-y-px hover:border-primary",
          read && "opacity-60 hover:opacity-100",
        )}
      >
        <div className="relative size-[88px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-gradient-to-br from-surface-2 to-border">
          {data.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" className="size-full object-cover" />
          )}
          {data.isVideo && (
            <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
              <Play className="size-6" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Tag>{data.tag}</Tag>
          <h3 className="mt-[7px] mb-1.5 line-clamp-2 font-display text-[15.5px] font-bold leading-tight tracking-[-0.01em]">
            {data.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-text-dim">
            <span>{data.meta}</span>
            {!data.isVideo && data.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {data.readingTime}
              </span>
            )}
          </div>
        </div>
      </Link>
      {actions && (
        <div className="absolute top-2 right-2 z-10">{actions}</div>
      )}
    </div>
  );
}

export interface HeroCardData {
  href: string;
  source: string;
  kicker: string;
  title: string;
  excerpt: string;
  meta: string;
  image?: string;
  isVideo?: boolean;
  /** Temps de lecture pré-calculé — absent si wordCount non exposé ou si vidéo. */
  readingTime?: string;
}

/** Carte « à la une » en tête de feed. */
export function HeroCard({
  data,
  className,
  actions,
}: {
  data: HeroCardData;
  className?: string;
  /** Slot optionnel rendu en overlay coin sup. droit (ex : BookmarkButton). */
  actions?: ReactNode;
}) {
  const { isRead, markRead } = useReadArticles();
  const read = isRead(data.href);

  return (
    <div className="group relative">
      <Link
        href={data.href}
        onClick={() => markRead(data.href)}
        className={cn(
          "block overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-elev-1 transition-opacity duration-200",
          read && "opacity-60 hover:opacity-100",
          className,
        )}
      >
        <div className="relative h-[184px] bg-gradient-to-br from-brand-500/85 to-brand-600/55 lg:h-[340px]">
          {data.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" className="size-full object-cover" />
          )}
          <span className="absolute bottom-3 left-3 rounded-[7px] bg-black/55 px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[0.05em] text-white backdrop-blur-sm">
            {data.source}
          </span>
        </div>
        <div className="p-[18px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-tag-text-orange">
            {data.kicker}
          </div>
          <h2 className="my-2 font-display text-[22px] font-extrabold leading-[1.18] tracking-[-0.015em]">
            {data.title}
          </h2>
          <p className="text-sm text-text-dim">{data.excerpt}</p>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-2 text-xs text-text-dim">
            <span>{data.meta}</span>
            {!data.isVideo && data.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {data.readingTime}
              </span>
            )}
          </div>
        </div>
      </Link>
      {actions && (
        <div className="absolute top-2 right-2 z-10">{actions}</div>
      )}
    </div>
  );
}

"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { usePlayerStore } from "@/components/player/player-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { mediaLogoSrc } from "@/lib/media";
import type { Podcast } from "@/lib/api/types";

/**
 * Carte podcast en liste : pastille logo source, titre cliquable vers le
 * détail, badge source, durée humanisée et bouton ▶/❚❚ qui pilote le player
 * singleton. Le bouton et le lien sont deux cibles distinctes (a11y).
 */
export function PodcastCard({ podcast }: { podcast: Podcast }) {
  const content = podcast.content;
  const title = content?.title ?? "Podcast Athena";
  const source = content?.meta_media?.title ?? "Athena";
  const logo = mediaLogoSrc(content?.meta_media?.logo);
  const artwork = content?.image?.url ?? logo;
  const href = `/podcasts/${podcast.id}`;

  const currentId = usePlayerStore((s) => s.track?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const play = usePlayerStore((s) => s.play);
  const toggle = usePlayerStore((s) => s.toggle);

  const isCurrent = currentId === String(podcast.id);
  const isActive = isCurrent && isPlaying;

  function onPlayClick() {
    if (isCurrent) {
      toggle();
      return;
    }
    play({
      id: String(podcast.id),
      title,
      source,
      audioUrl: podcast.audioUrl,
      artwork,
      href,
      analytics: { refType: "podcast", refId: String(podcast.id) },
    });
  }

  const duration = formatDuration(podcast.duration);

  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 rounded-[var(--radius)] border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px",
        isCurrent ? "border-primary" : "border-border hover:border-primary",
      )}
    >
      <button
        type="button"
        onClick={onPlayClick}
        aria-pressed={isActive}
        aria-label={
          isActive ? `Mettre en pause ${title}` : `Écouter ${title}`
        }
        className={cn(
          "relative grid size-[52px] shrink-0 place-items-center overflow-hidden rounded-[12px] text-white transition-transform active:scale-95",
          "bg-gradient-to-br from-brand-500 to-brand-600",
        )}
      >
        {artwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <span className="relative grid size-7 place-items-center rounded-full bg-black/45 backdrop-blur-sm">
          {isActive ? (
            <Pause className="size-4" />
          ) : (
            <Play className="size-4 translate-x-px" />
          )}
        </span>
        {isActive && <Equalizer />}
      </button>

      <Link href={href} className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Tag orange>Podcast · {source}</Tag>
          {isActive && (
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-tag-text-orange">
              En lecture
            </span>
          )}
        </div>
        <h3 className="mt-[7px] mb-1 line-clamp-2 font-display text-[15.5px] font-bold leading-tight tracking-[-0.01em]">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-text-dim">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              className="size-4 rounded-full object-cover"
            />
          )}
          <span>{source}</span>
          {duration && (
            <>
              <span aria-hidden>·</span>
              <span>{duration}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}

/** Petit équaliseur décoratif (figé si prefers-reduced-motion). */
function Equalizer() {
  return (
    <span
      aria-hidden
      className="absolute bottom-1 right-1 flex items-end gap-[2px]"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-white motion-safe:animate-pulse"
          style={{ height: 5 + ((i % 2) + 1) * 3, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

/** Skeleton iso-dimension de `PodcastCard`. */
export function PodcastCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5">
      <Skeleton className="size-[52px] shrink-0 rounded-[12px]" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/** Liste de skeletons de cartes podcast. */
export function PodcastListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <PodcastCardSkeleton key={i} />
      ))}
    </div>
  );
}

import { Play } from "lucide-react";
import Link from "next/link";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";

export interface ContentCardData {
  href: string;
  tag: string;
  title: string;
  meta: string;
  /** image de vignette (optionnelle) */
  image?: string;
  isVideo?: boolean;
}

/** Carte de contenu en liste (feed). */
export function ContentCard({ data }: { data: ContentCardData }) {
  return (
    <Link
      href={data.href}
      className="group flex gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary"
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
        <div className="text-xs text-text-dim">{data.meta}</div>
      </div>
    </Link>
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
}

/** Carte « à la une » en tête de feed. */
export function HeroCard({
  data,
  className,
}: {
  data: HeroCardData;
  className?: string;
}) {
  return (
    <Link
      href={data.href}
      className={cn(
        "block overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-elev-1",
        className,
      )}
    >
      <div className="relative h-[184px] bg-gradient-to-br from-brand-500/85 to-brand-600/55">
        {data.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.image} alt="" className="size-full object-cover" />
        )}
        <span className="absolute left-3 top-3 rounded-[7px] bg-black/55 px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[0.05em] text-white backdrop-blur-sm">
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
        <div className="mt-3.5 text-xs text-text-dim">{data.meta}</div>
      </div>
    </Link>
  );
}

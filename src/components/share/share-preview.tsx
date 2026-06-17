import { ArrowUpRight, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import type { ShareableContentResponse } from "@/lib/api/types";

export interface SharePreviewProps {
  data: ShareableContentResponse;
  /** Lien interne vers la lecture complète : `/content/:key/:contentId`. */
  contentHref: string;
  /** Libellé source (ex. « BLAST »), si résolu via meta-media. */
  source?: string;
  /** Type de contenu pour le badge + CTA. */
  isVideo?: boolean;
  /** Affiche les boutons d'action internes. `false` quand le funnel les porte. */
  showActions?: boolean;
}

/**
 * Carte d'aperçu d'un contenu partagé (Server Component).
 * Réutilise le registre visuel de `HeroCard` (image 16:9 + badge source)
 * sans dupliquer ses styles internes. Affiche un CTA manuel vers la lecture
 * (pas d'auto-redirect — préserve le re-partage de l'URL, cf. spec §4.1).
 */
export function SharePreview({
  data,
  contentHref,
  source,
  isVideo = false,
  showActions = true,
}: SharePreviewProps) {
  const cta = isVideo ? "Regarder la vidéo" : "Lire l'article";

  return (
    <article className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-elev-1">
      <div className="relative aspect-video bg-gradient-to-br from-brand-500/85 to-brand-600/55">
        {data.image?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image.url}
            alt=""
            className="size-full object-cover"
          />
        )}
        {source && (
          <span className="absolute left-3 top-3 rounded-[7px] bg-black/55 px-2.5 py-[5px] text-[11px] font-bold uppercase tracking-[0.05em] text-white backdrop-blur-sm">
            {source}
          </span>
        )}
        {isVideo && (
          <span className="absolute inset-0 grid place-items-center text-white">
            <span className="grid size-14 place-items-center rounded-full bg-black/45 backdrop-blur-sm">
              <Play className="size-6" />
            </span>
          </span>
        )}
      </div>

      <div className="p-[18px] lg:p-6">
        <Tag orange>{isVideo ? "Vidéo partagée" : "Article partagé"}</Tag>
        <h1 className="my-2.5 font-display text-[22px] font-extrabold leading-[1.18] tracking-[-0.015em] lg:text-[26px]">
          {data.title}
        </h1>

        {showActions && (
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button
              render={<Link href={contentHref} />}
              className="w-full sm:w-auto"
            >
              <Play />
              {cta} dans Athena
            </Button>

            {data.originalUrl && (
              <Button
                variant="ghost"
                render={
                  <a
                    href={data.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                className="w-full sm:w-auto"
              >
                Source originale
                <ArrowUpRight />
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

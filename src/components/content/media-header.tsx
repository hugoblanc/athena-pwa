import { ExternalLink, FileText, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import type { MetaMedia } from "@/lib/api/types";

/**
 * En-tête de la page détail d'un média : logo (fallback initiale dégradé),
 * titre, badge type, compteur de contenus et actions (don, lien site).
 * Server-friendly — les actions sont de simples liens `<a target="_blank">`.
 */
export function MediaHeader({
  media,
  total,
}: {
  media: MetaMedia;
  total?: number;
}) {
  const isVideo = media.type === "YOUTUBE";
  const typeLabel = isVideo ? "Vidéos" : "Articles";
  const showDonation = media.isDonationActivated && media.donation;

  return (
    <header className="mb-5 border-b border-border pb-5">
      <div className="flex items-start gap-4">
        <Avatar
          src={media.logo}
          name={media.title}
          size={64}
          square
          className="lg:size-16"
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em] lg:text-[28px]">
            {media.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-dim">
            <Tag orange>
              {isVideo ? (
                <span className="inline-flex items-center gap-1">
                  <Video className="size-3" /> {typeLabel}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3" /> {typeLabel}
                </span>
              )}
            </Tag>
            {typeof total === "number" && total > 0 && (
              <span>
                {total} contenu{total > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {showDonation && (
          <a
            href={media.donation}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Soutenir ${media.title}`}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text transition-colors duration-150 hover:border-text-faint"
          >
            Soutenir
          </a>
        )}
        {media.url && (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir le site de ${media.title}`}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--radius)] bg-transparent px-3.5 text-[13px] font-semibold text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
          >
            <ExternalLink className="size-[18px]" />
            Voir le site
          </a>
        )}
      </div>
    </header>
  );
}

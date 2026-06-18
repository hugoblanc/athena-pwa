import { Video, FileText } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { mediaLogoSrc } from "@/lib/media";
import { countryFlag } from "@/lib/format";
import type { MetaMedia } from "@/lib/api/types";

/** Carte média (annuaire des médias libres). */
export function MediaCard({ media }: { media: MetaMedia }) {
  const isVideo = media.type === "YOUTUBE";
  return (
    <Link
      href={`/medias/${media.key}`}
      className="group flex items-center gap-3.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary"
    >
      <Avatar src={mediaLogoSrc(media.logo)} name={media.title} size={48} square />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-[15.5px] font-bold">
          {media.title}
        </h3>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-dim">
          {isVideo ? (
            <Video className="size-3.5" />
          ) : (
            <FileText className="size-3.5" />
          )}
          {isVideo ? "Vidéos" : "Articles"}
          {media.countryCode && (
            <>
              <span className="text-text-faint">·</span>
              <span aria-label={media.countryCode}>{countryFlag(media.countryCode)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

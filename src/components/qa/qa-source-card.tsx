import { ExternalLink } from "lucide-react";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/format";
import type { QaSource } from "@/lib/api/types";

/**
 * Mini-carte source d'une réponse QA. Calquée sur ContentCard (version compacte).
 *
 * Navigation : faute de route de détail interne `/content/:id` disponible en
 * l'état, on ouvre le lien externe du média (`source.url`). À rebrancher vers
 * `/content/{contentId}` dès que la route existe (cf. décision ouverte §10.4).
 */
export function QaSourceCard({ source }: { source: QaSource }) {
  const isExternal = /^https?:\/\//.test(source.url);

  return (
    <a
      href={source.url}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-3 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <Tag>{source.mediaKey}</Tag>
        <ExternalLink className="size-3.5 shrink-0 text-text-faint transition-colors group-hover:text-primary" />
      </div>
      <h4 className="line-clamp-2 font-display text-[13.5px] font-bold leading-tight tracking-[-0.01em]">
        {source.title}
      </h4>
      {source.publishedAt && (
        <div className="text-[11px] text-text-dim">
          {formatDate(source.publishedAt)}
        </div>
      )}
    </a>
  );
}

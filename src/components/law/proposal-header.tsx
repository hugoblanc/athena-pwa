import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ShareButton } from "@/components/ui/share-button";
import { Tag } from "@/components/ui/tag";
import { formatDate } from "@/lib/format";
import type { LawProposal } from "@/lib/api/types";

/**
 * En-tête du détail : retour, type, titre (h1), méta dates/législature, partage.
 * Server Component (ShareButton est client mais auto-suffisant).
 */
export function LawProposalHeader({
  proposal,
  shareUrl,
  shareRefId,
}: {
  proposal: LawProposal;
  shareUrl: string;
  shareRefId: string;
}) {
  const isConstit = proposal.typeProposition === "constitutionnelle";

  return (
    <header className="space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/propositions"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-dim transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Propositions
        </Link>
        <ShareButton
          data={{ title: proposal.titre, url: shareUrl }}
          variant="icon"
          tracking={{ refType: "law", refId: shareRefId }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Tag orange={isConstit}>
          {isConstit ? "Constitutionnelle" : "Ordinaire"}
        </Tag>
        <span className="text-xs font-semibold text-text-dim">
          N° {proposal.numero}
        </span>
        {proposal.legislature && (
          <span className="text-xs text-text-dim">
            · {proposal.legislature}
          </span>
        )}
      </div>

      <h1 className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]">
        {proposal.titre}
      </h1>

      <div className="text-xs text-text-dim">
        {proposal.dateDepot
          ? `Déposée le ${formatDate(proposal.dateDepot)}`
          : proposal.dateMiseEnLigne
            ? `Mise en ligne le ${formatDate(proposal.dateMiseEnLigne)}`
            : null}
      </div>
    </header>
  );
}

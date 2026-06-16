import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { PoliticalGroupBadge } from "@/components/law/political-group-badge";
import type { LawProposalSummary } from "@/lib/api/types";
import { politicalGroup } from "@/lib/law/political-groups";
import { formatDate } from "@/lib/format";

/**
 * Carte de proposition de loi en liste (Server Component, présentation pure).
 * Lien englobant unique vers le détail (a11y : un seul lien par carte).
 */
export function LawProposalCard({ data }: { data: LawProposalSummary }) {
  const { auteur } = data;
  const groupColor = politicalGroup(auteur.groupePolitiqueCode).color;
  const simplified = data.simplified?.status === "completed";
  const pending = data.simplified?.status === "pending";
  const firstKeyPoint = simplified ? data.simplified?.keyPoints?.[0] : undefined;

  return (
    <Link
      href={`/propositions/${data.numero}`}
      className="group flex flex-col gap-2.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1 transition-[transform,border-color] duration-200 hover:-translate-y-px hover:border-primary motion-reduce:hover:translate-y-0"
    >
      {/* auteur */}
      <div className="flex items-center gap-2.5">
        <Avatar
          src={auteur.photoUrl}
          name={auteur.nom}
          size={36}
          ringColor={groupColor}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{auteur.nom}</div>
          <PoliticalGroupBadge code={auteur.groupePolitiqueCode} />
        </div>
      </div>

      {/* badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Tag>
          {data.typeProposition === "constitutionnelle"
            ? "Constitutionnelle"
            : "Ordinaire"}
        </Tag>
        {simplified && (
          <Tag orange>
            <span className="inline-flex items-center gap-1">
              <Sparkles className="size-3" aria-hidden />
              Version simplifiée
            </span>
          </Tag>
        )}
        {pending && <Tag>Simplification en cours</Tag>}
      </div>

      {/* titre */}
      <h3 className="line-clamp-2 font-display text-[15.5px] font-bold leading-tight tracking-[-0.01em]">
        {data.titre}
      </h3>

      {/* 1er key point */}
      {firstKeyPoint && (
        <p className="line-clamp-1 text-[13px] text-text-dim">{firstKeyPoint}</p>
      )}

      {/* méta */}
      <div className="text-xs text-text-dim">
        N° {data.numero}
        {data.dateMiseEnLigne && ` · ${formatDate(data.dateMiseEnLigne)}`}
        {data.coSignatairesCount > 0 &&
          ` · ${data.coSignatairesCount} co-signataire${
            data.coSignatairesCount > 1 ? "s" : ""
          }`}
      </div>
    </Link>
  );
}

/** Squelette de chargement de la carte. */
export function LawProposalCardSkeleton() {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-[var(--radius)] border border-border bg-surface p-3.5 shadow-elev-1"
      aria-hidden
    >
      <div className="flex items-center gap-2.5">
        <div className="size-9 shrink-0 animate-pulse rounded-full bg-surface-2" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface-2" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
      <div className="space-y-1.5">
        <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
    </div>
  );
}

import { Hammer } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Issue } from "@/lib/api/types";
import { IssueCard } from "./issue-card";
import { STATUS_META, STATUS_ORDER, StatusBadge } from "./status-badge";

/**
 * Liste roadmap.
 * - `grouped` (défaut) : sections par statut (En cours / Validé / Proposé /
 *   Terminé), `rejected` masqué — vue « Tous ».
 * - sinon : liste à plat (utilisée quand un statut précis est filtré, ce qui
 *   permet aussi d'afficher « Refusé »).
 * Au sein d'un groupe, l'ordre de l'API est conservé (tri par votes décroissants).
 */
export function RoadmapList({
  issues,
  error,
  grouped = true,
  emptyAction,
}: {
  issues: Issue[];
  error?: boolean;
  grouped?: boolean;
  /** Action affichée dans l'état vide (déclencheur de la modale). */
  emptyAction?: ReactNode;
}) {
  if (error) {
    return (
      <EmptyState
        icon={Hammer}
        title="Impossible de charger la roadmap"
        description="Réessayez dans un instant."
      />
    );
  }

  if (issues.length === 0) {
    return (
      <EmptyState
        icon={Hammer}
        title="Aucune demande pour l'instant"
        description="Soyez le premier à proposer une amélioration. Les idées les plus votées orientent les priorités."
        action={emptyAction}
      />
    );
  }

  // Liste à plat (un statut filtré).
  if (!grouped) {
    return (
      <div className="flex flex-col gap-3">
        {issues.map((issue, i) => (
          <IssueCard key={issue.id ?? i} issue={issue} />
        ))}
      </div>
    );
  }

  // Regroupe par statut en respectant l'ordre des sections.
  const groups = STATUS_ORDER.map((status) => ({
    status,
    items: issues.filter((i) => (i.status ?? "open") === status),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-7">
      {groups.map(({ status, items }) => (
        <section key={status} aria-label={STATUS_META[status]?.label}>
          <header className="mb-3 flex items-center gap-2.5">
            <StatusBadge status={status} />
            <span className="text-[13px] font-semibold text-text-faint">
              {items.length}
            </span>
          </header>
          <div className="flex flex-col gap-3">
            {items.map((issue, i) => (
              <IssueCard key={issue.id ?? i} issue={issue} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { Hammer } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import type { Issue } from "@/lib/api/types";
import { IssueCard } from "./issue-card";

/**
 * Wrapper de liste : empty / erreur / mapping `IssueCard`.
 *
 * En v1 il n'y a PAS de source de liste (cf. roadmap.ts §10) : `issues` est
 * vide et on rend l'`EmptyState` explicatif avec l'action « Proposer ».
 * Dès qu'un `GET /issues` propre existera, alimenter `issues` côté RSC parent.
 */
export function RoadmapList({
  issues,
  error,
  emptyAction,
}: {
  issues: Issue[];
  error?: boolean;
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

  return (
    <div className="flex flex-col gap-3">
      {issues.map((issue, i) => (
        <IssueCard key={issue.id ?? i} issue={issue} />
      ))}
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PoliticalGroupBadge } from "@/components/law/political-group-badge";
import { politicalGroup } from "@/lib/law/political-groups";
import type { Depute } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/**
 * Avatar coloré (groupe) + nom + groupe d'un député.
 * Devient un lien externe vers la fiche AN si `urlDepute` est présent.
 * Server-friendly (pas d'état).
 */
export function DeputeChip({
  depute,
  size = 40,
  className,
}: {
  depute: Depute;
  size?: number;
  className?: string;
}) {
  const color = politicalGroup(depute.groupePolitiqueCode).color;

  const inner = (
    <>
      <Avatar
        src={depute.photoUrl}
        name={depute.nom}
        size={size}
        ringColor={color}
      />
      <span className="min-w-0">
        <span className="flex items-center gap-1 truncate text-sm font-semibold">
          {depute.nom}
          {depute.urlDepute && (
            <ExternalLink
              aria-hidden
              className="size-3 shrink-0 text-text-faint"
            />
          )}
        </span>
        <PoliticalGroupBadge code={depute.groupePolitiqueCode} />
      </span>
    </>
  );

  if (depute.urlDepute) {
    return (
      <a
        href={depute.urlDepute}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Fiche de ${depute.nom} sur l'Assemblée nationale, nouvel onglet`}
        className={cn(
          "flex items-center gap-2.5 rounded-[var(--radius)] transition-opacity hover:opacity-80",
          className,
        )}
      >
        {inner}
      </a>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>{inner}</div>
  );
}

import { politicalGroup } from "@/lib/law/political-groups";
import type { PoliticalGroupCode } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/**
 * Pastille libellé d'un groupe politique avec un point de couleur (jamais la
 * couleur seule — le libellé reste toujours présent, cf. a11y des specs).
 */
export function PoliticalGroupBadge({
  code,
  className,
}: {
  code: PoliticalGroupCode;
  className?: string;
}) {
  const { label, color } = politicalGroup(code);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold text-text-dim",
        className,
      )}
    >
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="truncate">{label}</span>
    </span>
  );
}

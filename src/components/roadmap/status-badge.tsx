import { cn } from "@/lib/cn";

/**
 * Métadonnées d'affichage des statuts d'idée (roadmap PWA uniquement).
 * `rejected` est volontairement absent de l'ordre d'affichage (masqué).
 */
export const STATUS_META: Record<
  string,
  { label: string; pill: string; dot: string }
> = {
  in_progress: {
    label: "En cours",
    pill: "bg-primary/15 text-tag-text-orange",
    dot: "bg-primary",
  },
  planned: {
    label: "Validé",
    pill: "bg-[#4f8cf7]/15 text-[#6fa1ff]",
    dot: "bg-[#4f8cf7]",
  },
  open: {
    label: "Proposé",
    pill: "bg-tag-bg text-tag-text",
    dot: "bg-text-faint",
  },
  done: {
    label: "Terminé",
    pill: "bg-success/15 text-success",
    dot: "bg-success",
  },
  rejected: {
    label: "Refusé",
    pill: "bg-danger/15 text-danger",
    dot: "bg-danger",
  },
};

/**
 * Ordre des sections dans la vue groupée « Tous » (du plus actif au terminé).
 * `rejected` est exclu de cette vue (visible via le filtre « Refusé »).
 */
export const STATUS_ORDER = ["in_progress", "planned", "open", "done"] as const;

/**
 * Ordre/labels pour les filtres (inclut « Tous » et « Refusé »).
 * `value` "" = tous. Aligné sur le vocabulaire produit.
 */
export const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tous" },
  { value: "open", label: "Proposé" },
  { value: "planned", label: "Validé" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminé" },
  { value: "rejected", label: "Refusé" },
];

/** Pastille de statut (libellé + point coloré). */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em]",
        meta.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  );
}

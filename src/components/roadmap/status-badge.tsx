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
    label: "Prévu",
    pill: "bg-tag-bg text-tag-text",
    dot: "bg-text-dim",
  },
  open: {
    label: "Proposé",
    pill: "bg-tag-bg text-tag-text",
    dot: "bg-text-faint",
  },
  done: {
    label: "Livré",
    pill: "bg-success/15 text-success",
    dot: "bg-success",
  },
  rejected: {
    label: "Écarté",
    pill: "bg-danger/15 text-danger",
    dot: "bg-danger",
  },
};

/** Ordre des sections de la roadmap (du plus actif au livré). */
export const STATUS_ORDER = ["in_progress", "planned", "open", "done"] as const;

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

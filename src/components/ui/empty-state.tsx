import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** État vide générique : icône + titre + sous-texte + action optionnelle. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="grid size-14 place-items-center rounded-full bg-surface-2 text-text-faint">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="font-display text-[17px] font-bold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-text-dim">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * En-tête de section/groupe (annuaire médias, sections de notifs…).
 * Slot d'action à droite (ex. switch « tout activer »).
 */
export function SectionHeader({
  title,
  action,
  sticky = false,
  className,
}: {
  title: string;
  action?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2.5",
        sticky && "sticky top-0 z-[5] bg-bg/85 backdrop-blur-sm",
        className,
      )}
    >
      <h2 className="font-display text-[17px] font-extrabold tracking-[-0.01em]">
        {title}
      </h2>
      {action}
    </div>
  );
}

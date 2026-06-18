import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Conteneur de réglages : items séparés par un liseré, coins arrondis. */
export function SettingsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}

const rowBase =
  "flex min-h-[56px] w-full items-center gap-3.5 px-4 py-3 text-start text-text transition-colors hover:bg-surface-2";

interface RowProps {
  icon: LucideIcon;
  label: string;
  /** Élément affiché à droite (toggle, valeur…). Remplace le chevron. */
  trailing?: ReactNode;
}

/** Ligne de réglage cliquable → route interne (avec chevron). */
export function SettingsLinkRow({
  icon: Icon,
  label,
  href,
}: RowProps & { href: string }) {
  return (
    <Link href={href} className={rowBase}>
      <Icon className="size-[18px] shrink-0 text-text-dim" aria-hidden="true" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight
        className="size-[18px] shrink-0 text-text-faint rtl:rotate-180"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Ligne de réglage statique (toggle / valeur à droite, pas de navigation). */
export function SettingsRow({ icon: Icon, label, trailing }: RowProps) {
  return (
    <div className={cn(rowBase, "hover:bg-transparent")}>
      <Icon className="size-[18px] shrink-0 text-text-dim" aria-hidden="true" />
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      {trailing}
    </div>
  );
}

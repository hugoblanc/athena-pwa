"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";
import { NAV_ENTRIES } from "./nav-config";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Navigation desktop (≥ lg). */
export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  return (
    <aside
      className={cn(
        // `border-e` (logique) → bord côté « fin de ligne » : droite en LTR, gauche en RTL.
        "flex h-dvh flex-col gap-1 border-e border-border bg-surface px-[14px] py-[22px]",
        className,
      )}
    >
      <Brand className="px-3 pb-[22px]" />

      <nav className="flex flex-col gap-1">
        {NAV_ENTRIES.map(({ href, key, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-[13px] rounded-[11px] px-[14px] py-[11px] text-[14.5px] font-semibold transition-colors",
                active
                  ? "bg-primary text-on-primary"
                  : "text-text-dim hover:bg-surface-2 hover:text-text",
              )}
            >
              <Icon className="size-[19px] shrink-0" strokeWidth={2} />
              {t(`${key}.label`)}
            </Link>
          );
        })}
      </nav>

      {/* Sélecteur de langue, poussé en bas du menu. */}
      <div className="mt-auto px-1 pt-4">
        <LocaleSwitcher label={tc("language")} />
      </div>
    </aside>
  );
}

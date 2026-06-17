"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ENTRIES } from "./nav-config";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Navigation mobile (< lg) — barre d'onglets en bas. */
export function TabBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        // Fixée en bas du viewport : le <main> réserve déjà l'espace (pb-160px).
        // Sans ça, la barre passait dans le flux et glissait sous le contenu.
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="flex h-[72px] items-stretch px-1.5">
        {NAV_ENTRIES.map(({ href, short, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold transition-colors",
                active ? "text-primary" : "text-text-dim",
              )}
            >
              <Icon className="size-[21px]" strokeWidth={2} />
              {short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

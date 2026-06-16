"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";
import { NAV_ENTRIES } from "./nav-config";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Navigation desktop (≥ lg). */
export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-dvh flex-col gap-1 border-r border-border bg-surface px-[14px] py-[22px]",
        className,
      )}
    >
      <Brand className="px-3 pb-[22px]" />

      <nav className="flex flex-col gap-1">
        {NAV_ENTRIES.map(({ href, label, icon: Icon }) => {
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
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

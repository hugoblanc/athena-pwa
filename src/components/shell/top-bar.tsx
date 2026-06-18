"use client";

import { Bookmark, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { IconButton } from "@/components/ui/button";
import { trackFeature } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { AccountButton } from "./account-nav";
import { Brand } from "./brand";

/** Barre supérieure mobile (< lg) : marque + actions. */
export function TopBar({ className }: { className?: string }) {
  const tc = useTranslations("common");
  const trl = useTranslations("readingList");
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pt-[max(14px,env(safe-area-inset-top))] pb-3.5",
        className,
      )}
    >
      <Brand />
      <div className="flex items-center gap-2">
        <LocaleSwitcher label={tc("language")} compact />
        <Link
          href="/reading-list"
          aria-label={trl("title")}
          className="grid size-9 place-items-center rounded-full text-text-dim transition-colors hover:bg-surface-2 hover:text-text"
        >
          <Bookmark className="size-[19px]" />
        </Link>
        <IconButton aria-label="Rechercher">
          <Search />
        </IconButton>
        <ThemeToggle />
        <AccountButton />
      </div>
    </header>
  );
}

/** Bascule clair/sombre. Exporté pour réutilisation (sidebar desktop, réglages). */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avant le montage client, on rend un placeholder stable (identique SSR/client)
  // pour éviter tout hydration mismatch lié au thème résolu.
  if (!mounted) {
    return (
      <IconButton aria-label="Changer de thème">
        <Moon />
      </IconButton>
    );
  }

  const isDark = resolvedTheme === "dark";
  return (
    <IconButton
      aria-label={isDark ? "Passer en clair" : "Passer en sombre"}
      onClick={() => {
        trackFeature("theme_toggle");
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
}

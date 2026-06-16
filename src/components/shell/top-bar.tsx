"use client";

import { Search, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";

/** Barre supérieure mobile (< lg) : marque + actions. */
export function TopBar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-center justify-between bg-bg px-5 pt-[max(14px,env(safe-area-inset-top))] pb-3.5",
        className,
      )}
    >
      <Brand />
      <div className="flex gap-2">
        <IconButton aria-label="Rechercher">
          <Search />
        </IconButton>
        <ThemeToggle />
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
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </IconButton>
  );
}

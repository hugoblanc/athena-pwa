"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioPlayer } from "@/components/player/audio-player";
import { Brand } from "./brand";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";
import { TopBar } from "./top-bar";

/**
 * Routes « funnel » : landings de conversion (lien partagé) servies SANS la
 * navigation principale. Le visiteur arrive avec une intention unique — on ne
 * lui offre pas 5 portes de sortie (sidebar/tabbar), seulement le contenu et
 * l'action d'install. Voir `share-funnel.tsx`.
 */
function isFunnelRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/share") || pathname.startsWith("/installer");
}

/**
 * Coquille adaptative : sidebar desktop (≥ lg) / tab bar mobile (< lg).
 * Le player audio est monté ICI (singleton, survit à la nav). Sur les routes
 * funnel, on bascule sur une coquille minimale (logo seul).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isFunnelRoute(pathname)) {
    return <FunnelShell>{children}</FunnelShell>;
  }

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar className="hidden lg:flex lg:sticky lg:top-0" />

      <div className="flex min-h-dvh flex-col">
        <TopBar className="lg:hidden" />

        <main className="flex-1 pb-[160px] lg:pb-[88px]">{children}</main>

        <AudioPlayer />
        <TabBar className="lg:hidden" />
      </div>
    </div>
  );
}

/**
 * Coquille minimale pour les landings de partage : bandeau logo (retour accueil)
 * + contenu centré, aucune navigation. Réduit les distractions au profit de la
 * seule conversion visée (installer l'app / lire le contenu).
 */
function FunnelShell({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-center border-b border-border/60 px-5 py-3.5">
        <Link href="/" aria-label={t("home")}>
          <Brand />
        </Link>
      </header>
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}

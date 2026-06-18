"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackScreen, trackSession, type ScreenName } from "@/lib/analytics";
import { isStandalone } from "@/lib/pwa";

/**
 * Traceur d'usage global (monté une fois dans le layout). Émet :
 *  - `session_start` une fois par session d'onglet (navigateur vs PWA installée),
 *  - `screen_view` à chaque changement d'écran.
 *
 * 100% agrégé/anonyme via `/api/loop`. No-op si Do Not Track (géré dans `track`).
 * Aucune donnée d'URL libre n'est envoyée : on ne transmet que le NOM d'écran
 * issu de l'allowlist `ScreenName`, jamais le pathname brut (pas d'IDs, pas de
 * query). Les routes inconnues ne sont pas tracées.
 */

const SESSION_FLAG = "ath_session_tracked";

/** Mappe un pathname vers un nom d'écran de l'allowlist (ou null si non suivi). */
function screenFromPath(pathname: string): ScreenName | null {
  if (pathname === "/") return "feed";

  const seg = pathname.split("/").filter(Boolean);
  switch (seg[0]) {
    case "qa":
      return "qa";
    case "propositions":
      return seg.length > 1 ? "law_detail" : "laws";
    case "content":
      return "content_detail";
    case "podcasts":
      return seg.length > 1 ? "podcast_detail" : "podcasts";
    case "medias":
      return "media";
    case "profile":
      return "profile";
    case "installer":
      return "installer";
    case "share":
      return "share";
    case "login":
    case "register":
      return "auth";
    case "informations":
    case "roadmap":
    case "evolution":
    case "privacy":
      return "info";
    default:
      return null;
  }
}

export function UsageTracker() {
  const pathname = usePathname();
  const lastScreen = useRef<ScreenName | null>(null);

  // session_start une seule fois par session d'onglet.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_FLAG)) return;
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      /* sessionStorage indisponible : on émet quand même, au pire un doublon. */
    }
    trackSession(isStandalone() ? "installed" : "browser");
  }, []);

  // screen_view à chaque changement d'écran.
  useEffect(() => {
    const screen = screenFromPath(pathname);
    if (!screen || screen === lastScreen.current) return;
    lastScreen.current = screen;
    trackScreen(screen);
  }, [pathname]);

  return null;
}

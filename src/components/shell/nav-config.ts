import { Home, LayoutGrid, Music, Scale, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { QA_ENABLED } from "@/lib/features";

export interface NavEntry {
  href: string;
  /** Clé de traduction sous le namespace `nav` (ex. `nav.feed.label`/`.short`). */
  key: "feed" | "medias" | "podcasts" | "laws" | "qa";
  icon: LucideIcon;
}

/**
 * Navigation principale — identique mobile (tab bar) et desktop (sidebar).
 * L'entrée Q&A n'apparaît que si la feature est activée (cf. `QA_ENABLED`).
 */
export const NAV_ENTRIES: NavEntry[] = [
  { href: "/", key: "feed", icon: Home },
  { href: "/medias", key: "medias", icon: LayoutGrid },
  { href: "/podcasts", key: "podcasts", icon: Music },
  { href: "/propositions", key: "laws", icon: Scale },
  ...(QA_ENABLED
    ? [{ href: "/qa", key: "qa", icon: Sparkles } as NavEntry]
    : []),
];

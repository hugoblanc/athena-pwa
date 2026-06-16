import { Home, LayoutGrid, Music, Scale, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavEntry {
  href: string;
  label: string;
  /** label court pour la tab bar mobile */
  short: string;
  icon: LucideIcon;
}

/** Navigation principale — identique mobile (tab bar) et desktop (sidebar). */
export const NAV_ENTRIES: NavEntry[] = [
  { href: "/", label: "Fil d'actu", short: "Fil", icon: Home },
  { href: "/medias", label: "Médias", short: "Médias", icon: LayoutGrid },
  { href: "/podcasts", label: "Podcasts", short: "Podcasts", icon: Music },
  { href: "/propositions", label: "Propositions de loi", short: "Lois", icon: Scale },
  { href: "/qa", label: "Demander à Athena", short: "Athena", icon: Sparkles },
];

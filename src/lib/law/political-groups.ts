import type { PoliticalGroupCode } from "@/lib/api/types";

/**
 * Palette + libellés des groupes politiques (Assemblée nationale).
 * Source unique (les specs propositions + détail référençaient deux maps).
 * Couleurs indicatives — neutralité éditoriale.
 */
export const POLITICAL_GROUPS: Record<
  PoliticalGroupCode,
  { label: string; color: string }
> = {
  RN: { label: "Rassemblement National", color: "#243b6b" },
  LFI_NFP: { label: "La France insoumise", color: "#cc2443" },
  SOC: { label: "Socialistes", color: "#ff8080" },
  ECO: { label: "Écologistes", color: "#23b14d" },
  GDR: { label: "Gauche démocrate et républicaine", color: "#bd0e2e" },
  EPR: { label: "Ensemble pour la République", color: "#ffd700" },
  DEM: { label: "Les Démocrates", color: "#ff9500" },
  HOR: { label: "Horizons", color: "#2aa5d6" },
  DR: { label: "Droite Républicaine", color: "#0a6cb0" },
  UDR: { label: "UDR", color: "#1f4e8c" },
  NI: { label: "Non inscrits", color: "#9a9aa8" },
  UNKNOWN: { label: "Inconnu", color: "#9a9aa8" },
};

export function politicalGroup(code: PoliticalGroupCode) {
  return POLITICAL_GROUPS[code] ?? POLITICAL_GROUPS.UNKNOWN;
}

/** Base URL de l'API NestJS Athena. Configurée via NEXT_PUBLIC_API_URL. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Politiques de cache par défaut (Next fetch). */
export const CACHE = {
  /** Listes de contenu : ISR 60 s. */
  list: { next: { revalidate: 60 } },
  /** Détail : ISR 5 min. */
  detail: { next: { revalidate: 300 } },
  /** Données fraîches à chaque requête. */
  live: { cache: "no-store" as const },
} satisfies Record<string, RequestInit>;

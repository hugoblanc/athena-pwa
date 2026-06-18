/**
 * Initialisation PostHog côté client (Next.js 16 — fichier `instrumentation-client`
 * exécuté avant l'hydratation). Analytics produit COMPLÉMENTAIRE au système maison
 * (`src/lib/analytics.ts`), il ne le remplace pas.
 *
 * Choix clés (cf. discussion) :
 * - **Reverse-proxy** : `api_host: "/ingest"` → les events transitent par notre
 *   domaine (rewrites dans next.config), jamais par *.posthog.com. Indispensable
 *   pour capter l'audience iranienne (filternet) et contourner les ad-blockers.
 * - **Vie privée** : `person_profiles: "identified_only"` (events anonymes par
 *   défaut), `respect_dnt: true`.
 * - **Session replay activé mais MASQUÉ** : `maskAllInputs` masque tout ce qui est
 *   saisi (questions QA, message du sondage). Le pays vient du GeoIP serveur de
 *   PostHog (pas besoin d'IP côté client).
 *
 * No-op si le token est absent (build/preview sans analytics).
 */
import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token && typeof window !== "undefined") {
  posthog.init(token, {
    // Proxy same-origin (cf. rewrites /ingest). ui_host = vrai domaine pour les
    // liens « ouvrir dans PostHog » côté toolbar.
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    defaults: "2025-05-24",

    // Vie privée.
    person_profiles: "identified_only",
    respect_dnt: true,

    // Mesure d'usage (périmètre « complet »).
    capture_pageview: "history_change", // SPA App Router : pageview au changement de route
    capture_pageleave: true,
    autocapture: true,
    enable_heatmaps: true,

    // Session replay : activé, mais on masque toute saisie utilisateur.
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      // Masque aussi le texte des éléments explicitement marqués `data-ph-mask`
      // (ex. bulle de question QA rendue à l'écran).
      maskTextSelector: "[data-ph-mask]",
    },
  });
}

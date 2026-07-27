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
 * No-op si le token est absent (build/preview sans analytics) ou en local
 * (localhost / 127.0.0.1) pour ne pas polluer les stats avec le dev.
 */
import posthog from "posthog-js";

/**
 * Hôte de prod canonique de la PWA (cf. [[athena-deploiement-prod]]).
 * Sert à borner le repli sur `FALLBACK_TOKEN` ci-dessous.
 */
const PRODUCTION_HOSTNAME = "athena-app.xyz";

/**
 * Token PUBLIC du projet PostHog « Athena » (Cloud EU). Il est de toute façon
 * visible dans le bundle de chaque visiteur : PostHog documente le project API
 * token comme non secret (il n'autorise que l'ingestion, aucune lecture).
 *
 * Pourquoi en dur : les variables `NEXT_PUBLIC_*` sont inlinées AU BUILD, donc un
 * oubli dans les App Configs CapRover (ou un `--build-arg` manquant) coupe
 * silencieusement toute la mesure — c'est exactement ce qui s'est produit, sans
 * la moindre erreur visible. Ce repli rend l'instrumentation increvable.
 *
 * Athena étant open source, le repli est **borné à l'hôte de prod** : un fork
 * auto-hébergé n'enverra jamais ses events dans notre projet, il doit poser son
 * propre `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (qui reste prioritaire partout).
 */
const FALLBACK_TOKEN = "phc_C6vX44DZFD4TCEF3vb2yNj3wnn2mFFGXrVW86DoATXQF";

const hostname =
  typeof window !== "undefined" ? window.location.hostname : undefined;

const token =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  (hostname === PRODUCTION_HOSTNAME ? FALLBACK_TOKEN : undefined);

const isLocalhost =
  hostname !== undefined && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname);

if (token && typeof window !== "undefined" && !isLocalhost) {
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

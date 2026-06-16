@AGENTS.md

# Athena PWA

Refonte de l'app Athena (médias libres) : **PWA Next.js unique** remplaçant l'app
hybride Ionic/Angular 13. Mobile installable + desktop responsive, un seul codebase.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (config CSS-first
`@theme`) · **Base UI 1.x** (primitives unstyled, paquet `@base-ui/react`) · `next-themes`
(clair/sombre via attribut `data-theme`) · Zustand (store player) · Zod · Firebase Auth
(client) · `web-push` côté backend. Pas de Serwist (incompatible Turbopack en v9) → **service
worker écrit à la main** (`public/sw.js`).

## Backend

On **garde NestJS** (`../athena_api`, prod `https://www.athena-app.fr`). Next = frontend + BFF.
L'API est quasi 100% publique ; seuls `/auth/*` et `/push/*` exigent un Bearer Firebase.
Toute la couche d'accès est dans `src/lib/api/` (client typé, pagination unifiée — 4 formes
d'enveloppes API → `UnifiedPage`, `authFetch` avec Bearer + retry 401, parse défensif des
`sources` QA stockées en string).

## Design System « Signal »

Dark-first, accent orange Athena `#FC743A`. Tokens sémantiques dans `globals.css`
(`bg-surface text-text text-text-dim border-border bg-primary` …). **Toujours styler via les
tokens, jamais de couleur en dur.** Composants partagés dans `src/components/` :
`ui/` (Button, Tag, FilterChips, Switch, Slider, Skeleton, EmptyState, InfiniteSentinel,
SearchField, Avatar, Tabs, TextField, ShareButton…), `content/`, `shell/` (sidebar desktop /
tabbar mobile — les écrans vivent dedans), `player/` (singleton + MediaSession + playbackRate).
Le design system vivant de référence : `../design-spike/design-system.html` et `DESIGN_SYSTEM.md`.

## Conventions

- Server Components par défaut ; `"use client"` seulement aux feuilles interactives.
- Pagination : `<InfiniteSentinel>` + « Charger plus ». État filtres/recherche **dans l'URL**.
- Dates via `src/lib/format.ts` (Intl natif). Partage via `<ShareButton>` global unique.
- Mode invité : lecture libre **sans** login (pas de gate auth sur le contenu public).
- Push : Web Push **VAPID** (pas FCM), opt-out (tout activé par défaut).
- Specs détaillées par écran dans `docs/specs/`.

## Lancer / build

```bash
npm run dev      # dev (Turbopack), port 3000 (ou 3001 si occupé)
npm run build    # build prod (output: 'standalone' pour Docker/CapRover)
npx tsc --noEmit # typecheck
```
`.env.local` (gitignoré) : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FIREBASE_*` (projet
`open-athena`), `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Voir `.env.example`.

## État / reste à faire

- 16 écrans codés, build prod OK contre l'API de prod.
- **À faire** : déploiement CapRover (VPS `54.37.226.134`, `output: standalone`) ; wiring final
  notif-préférences + roadmap sur les nouveaux endpoints backend ; QA device (install + push iOS).
- Migration de la base installée (différée) : après prod, banner + notif douce dans l'app Ionic
  existante (pas de coquille WebView). Comptes migrent ~gratuitement (Firebase centralisé).

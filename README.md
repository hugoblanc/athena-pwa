# Athena PWA

PWA (Progressive Web App) d'Athena — plateforme open-source d'agrégation et de
notification de contenus des médias indépendants français (« médias libres »).

Refonte en **Next.js** de l'application mobile historique (Ionic/Angular), unifiée
en une seule app installable sur mobile et responsive sur desktop.

## Stack

- **Next.js 16** (App Router) · React 19 · TypeScript
- **Tailwind CSS v4** (design system « Signal », clair/sombre)
- **Base UI** (primitives accessibles)
- **Firebase Auth** · **Web Push** (VAPID)
- Backend : API NestJS [`athena_api`](https://github.com/hugoblanc/athena_api)

## Développement

```bash
npm install
cp .env.example .env.local   # puis renseigner les variables
npm run dev                  # http://localhost:3000
```

## Build

```bash
npm run build   # build de production (output: standalone)
npm start
```

## Déploiement

Conteneurisé (`Dockerfile` + `captain-definition`) pour un déploiement CapRover.
Les variables `NEXT_PUBLIC_*` sont injectées au build (build-args).

## Variables d'environnement

Voir [`.env.example`](./.env.example) : URL de l'API, config Firebase (client),
clé publique VAPID.

---

Fait avec [Claude Code](https://claude.com/claude-code).

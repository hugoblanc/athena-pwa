# Spec écran — Fil d'actu

## 1. Route & placement nav

- **Route** : `/` (racine, écran par défaut de l'app).
- **Placement nav** : premier item de `NAV_ENTRIES` (`{ href: "/", label: "Fil d'actu", short: "Fil", icon: Home }`) — onglet actif sur la TabBar mobile et la Sidebar desktop. L'écran vit **dans** l'`AppShell` existant (`src/components/shell/app-shell.tsx`) ; ne rien re-spécifier du shell.
- **Type de fichier** : `src/app/page.tsx` (Server Component) + sous-arbre client pour l'interactivité (voir §3 et §7).

## 2. Objectif (2-3 lignes)

Présenter le flux agrégé de tous les médias libres dans un fil unique, paginé et infini, avec recherche plein texte et filtres par type/média. C'est le cœur de l'usage : l'utilisateur scanne les dernières publications (article, vidéo) et entre dans le détail d'un contenu en un tap. La première publication est mise en avant en **HeroCard**, le reste défile en **ContentCard**.

## 3. Données (API) — fonctions de lib/api, server vs client, cache, pagination

Source unique : `getLastContent` de `src/lib/api/content.ts`.

```ts
getLastContent({ page, size, terms?, mediaKeys? }): Promise<UnifiedPage<ContentLite>>
// GET /content/last — cache CACHE.list (ISR 60 s)
```

- **`UnifiedPage<ContentLite>`** (cf. `pagination.ts`) : `{ items, page, hasNext, total? }`. La pagination Content est **page-based 1-based** ; `hasNext` est dérivé de `next != null`. L'infinite scroll incrémente `page`.
- **`size`** : 10 par page (cohérent avec `PAGER_SIZE` API). Hero = `items[0]`, liste = `items.slice(1)` sur la première page ; pages suivantes intégralement en liste.
- **Filtres médias** : `mediaKeys?: string[]` (CSV côté API). La liste des médias pour peupler les chips vient de `getMetaMedias()` de `src/lib/api/meta-media.ts` (`GET /list-meta-media`, `CACHE.list`).
- **Filtre par type** (Tout / Articles / Vidéos) : **l'API `/content/last` n'expose pas de filtre `type`** (le contrat n'a que `terms` + `mediaKeys`). On filtre donc par **dérivation depuis `mediaKeys`** : « Vidéos » = `mediaKeys` des médias `type === "YOUTUBE"`, « Articles » = ceux `type === "WORDPRESS"`. Voir §10 (décision ouverte : confirmer ce mapping plutôt qu'un filtrage client post-fetch qui casserait la pagination). [À VALIDER]

**Server vs client :**

- **Server Component (`page.tsx`)** : fetch initial `getLastContent({ page: 1, size: 10 })` + `getMetaMedias()` en parallèle (`Promise.all`) → rendu SSR/ISR de la première page (SEO + first paint instantané). Passe `initialPage` (UnifiedPage) et `medias` (ListMetaMedia[]) en props au composant client.
- **Client Component (`FeedClient`, `"use client"`)** : reçoit `initialPage` + `medias`, gère l'état recherche/filtres/infinite scroll et les fetchs suivants via `getLastContent` (appelée côté client → tape l'API directement, `CACHE.list` ignoré côté navigateur mais ok). Re-fetch page 1 à chaque changement de `terms`/`mediaKeys`.
- **Cache** : `list` (ISR 60 s) pour le fil et les médias. Aucun usage de `live`/`detail` ici.

## 4. Améliorations UX proposées — concrètes, justifiées, [À VALIDER] si discutable

1. **Recherche debouncée (300 ms)** déclenchée depuis la TopBar mobile / un champ desktop, qui reset à `page: 1` et réinterroge `/content/last` avec `terms`. Justif : le fil est l'écran d'entrée, la recherche serveur (vs filtrage local) est déjà supportée par l'API.
2. **Synchronisation URL** des filtres et de la recherche via query params (`?q=...&medias=key1,key2&type=video`). Justif : partage/retour navigateur, deep-link, et permet de garder `page.tsx` SSR-aware des filtres initiaux. [À VALIDER] (sinon état local pur, plus simple mais non partageable).
3. **HeroCard cliquable = premier contenu réel** (pas un encart éditorial). Kicker = nom de la rubrique/source, source badge = `metaMedia.title`. Justif : réutilise `HeroCard` existant sans nouvelle donnée.
4. **Filtre média en overlay/sheet** au-delà de 4-5 médias (la row de chips devient illisible). Chips rapides pour Tout/Articles/Vidéos, puis un chip « Médias » ouvrant une feuille multi-sélection. [À VALIDER] (le DS ne prévoit qu'une sélection unique sur `FilterChips`).
5. **Bouton « Remonter en haut »** flottant après un certain scroll (réutilise le pattern FAB du DS, `rounded-full`). Justif : fil infini long.
6. **Pull-to-refresh** (mobile, PWA) revalidant la page 1. [À VALIDER] (non couvert par le DS, à arbitrer côté effort).
7. **Préchargement de la page suivante** quand le sentinel approche du viewport (IntersectionObserver `rootMargin` généreux) pour un scroll sans à-coups.

## 5. États — loading, empty, error, offline

- **Loading initial** : la première page est SSR donc pas de skeleton au premier chargement. Pour les changements de filtre/recherche côté client : afficher un **skeleton** = 1 bloc hero (rectangle 16:9 `bg-surface-2` animate-pulse) + 5 lignes ContentCard skeleton (thumb 88px + 2 barres de titre + 1 barre méta). Nouveau composant `FeedSkeleton`.
- **Loading pagination (scroll)** : spinner/loader discret centré sous la liste (3 dots ou skeleton de 2 cartes). Pas de skeleton plein écran.
- **Empty (aucun résultat)** : état vide avec icône (`SearchX` lucide), titre « Aucun résultat » + sous-texte contextualisé (« pour “{terms}” » / « pour ce filtre ») + bouton secondaire « Réinitialiser les filtres ». Composant `EmptyState` (générique, à créer).
- **Error (fetch échoué)** : carte d'erreur `border-danger`-toned, message « Impossible de charger le fil » + bouton `secondary` « Réessayer » (re-fetch). Pour l'erreur du fetch SSR initial : `error.tsx` au niveau route avec reset(). Pour les erreurs de pagination : bandeau inline « Échec du chargement — Réessayer » sans casser la liste déjà affichée.
- **Offline** : si `navigator.onLine === false`, bandeau non bloquant en tête (« Hors ligne — contenu en cache »). Le SW (app shell + dernières pages, hors scope feed) sert le cache si dispo ; sinon EmptyState offline avec bouton « Réessayer » réactivé au retour `online`.

## 6. Responsive — mobile (< lg) vs desktop (≥ lg)

- **Breakpoint** : `lg` (1024 px), géré par l'`AppShell`.
- **Mobile (< lg)** :
  - Recherche dans la **TopBar** (icône `Search` existante → ouvre un champ inline ou une sheet de recherche).
  - Row de **chips scrollable horizontalement** (sticky sous la top bar, `overflow-x-auto` déjà dans `FilterChips`).
  - Liste pleine largeur, gouttière 20 px.
  - HeroCard image ≈184 px de haut (valeur DS / composant existant).
- **Desktop (≥ lg)** :
  - Contenu centré `max-w-[640px]`, gouttière 32 px.
  - Champ de recherche **dans la colonne contenu** (en tête, au-dessus des chips) — pas de TopBar mobile.
  - Chips sur une ou deux lignes (wrap autorisé desktop) ; hover states actifs.
  - Hover des cartes : `-translate-y-px` + bordure primary (déjà dans `ContentCard`).
  - Le player audio (s'il joue) reste ancré en bas de la colonne ; le fil n'a pas à le gérer.

## 7. Composants — DS existants réutilisés + NOUVEAUX à créer

**Réutilisés (ne rien restyler) :**
- `AppShell` (`shell/app-shell.tsx`) — conteneur.
- `HeroCard` (`content/content-card.tsx`) — premier contenu.
- `ContentCard` (`content/content-card.tsx`) — items de liste. Mapper `ContentLite` → `ContentCardData` (`href`, `tag` = `TYPE · SOURCE`, `title`, `meta` = date relative, `image` = `image.url`, `isVideo` = `metaMedia.type === "YOUTUBE"`).
- `FilterChips` (`ui/filter-chips.tsx`) — segment type (Tout/Articles/Vidéos).
- `Tag` (`ui/tag.tsx`) — via les cartes.
- `Button` / `IconButton` (`ui/button.tsx`) — réessayer, reset, FAB.

**NOUVEAUX à créer :**
1. **`FeedClient`** (`features/feed/feed-client.tsx`, `"use client"`) — orchestrateur : état recherche/filtres, infinite scroll (IntersectionObserver), appels `getLastContent`, rendu Hero + liste + états.
2. **`SearchField`** (`ui/search-field.tsx`) — champ de recherche debouncé réutilisable (input ≥16 px anti-zoom iOS, icône, clear). Sert ici et ailleurs (podcasts).
3. **`MediaFilterSheet`** (`features/feed/media-filter-sheet.tsx`) — feuille de sélection multi-médias (Base UI `Dialog` en sheet mobile), alimentée par `getMetaMedias`. (Lié à l'amélioration §4.4, peut être différé si on garde une sélection unique.) [À VALIDER]
4. **`FeedSkeleton`** (`features/feed/feed-skeleton.tsx`) — skeleton hero + cartes.
5. **`EmptyState`** (`ui/empty-state.tsx`) — état vide générique (icône + titre + sous-texte + action), réutilisable hors feed.
6. **`InfiniteSentinel`** (`ui/infinite-sentinel.tsx`) — div observée + hook `useIntersection` déclenchant le chargement de la page suivante (réutilisable podcasts/lois).

## 8. Interactions — clics, navigation, gestes, audio

- **Tap sur HeroCard / ContentCard** → navigation `next/link` vers le détail contenu `/content/{metaMedia.key}/{contentId}` (toute la carte est un seul `<Link>`, déjà le cas).
- **Tap sur un chip** (Tout/Articles/Vidéos) → met à jour le filtre type, reset page 1, re-fetch.
- **Sélection médias** (sheet) → applique `mediaKeys`, reset page 1, re-fetch.
- **Saisie recherche** → debounce 300 ms → reset page 1 → re-fetch avec `terms` ; bouton clear vide `terms`.
- **Scroll vers le bas** → quand `InfiniteSentinel` entre dans le viewport et `hasNext === true` et pas déjà en chargement → `page + 1`, append des items.
- **FAB « haut de page »** → scroll smooth vers le top (respecter `prefers-reduced-motion`).
- **Audio** : le feed ne lit pas d'audio directement (pas de bouton play sur les cartes en v1) ; la lecture TTS se fait depuis le détail contenu. Le badge `isVideo`/`▶` sur la thumb est décoratif (la carte navigue, ne lit pas). [À VALIDER] si on veut un play TTS rapide depuis la carte.

## 9. Accessibilité — points spécifiques

- Chips : `role="tablist"`/`role="tab"`/`aria-selected` déjà en place dans `FilterChips`.
- Champ de recherche : `<label>` ou `aria-label="Rechercher dans le fil"`, `type="search"`, taille police ≥16 px.
- Infinite scroll : annoncer le chargement via `aria-live="polite"` (« Chargement de plus de contenus… ») et l'arrivée des résultats ; ne pas piéger le focus. Fournir un fallback bouton « Charger plus » accessible au clavier (le sentinel seul n'est pas activable au clavier).
- Cartes : un seul lien englobant, libellé accessible = titre du contenu ; thumbnails `alt=""` (décoratives, le titre porte le sens) — déjà le cas.
- FAB et IconButtons : `aria-label` obligatoire.
- Focus visible (anneau orange 2 px) sur chips, champ, cartes, FAB.
- `prefers-reduced-motion` : désactiver translate/scale au hover et le smooth-scroll du FAB.

## 10. Décisions ouvertes — questions pour l'utilisateur

1. **Filtre par type sans support API** : valider le mapping « type → liste de `mediaKeys` » (Vidéos = YOUTUBE, Articles = WORDPRESS) plutôt qu'un filtrage client post-fetch. Confirmer aussi que le couple type+médias peut se cumuler côté `mediaKeys`.
2. **Multi-sélection médias** : `FilterChips` est à sélection unique par design. Faut-il une vraie multi-sélection (sheet `MediaFilterSheet`) ou se contenter d'un seul média à la fois en v1 ?
3. **État dans l'URL** vs état local pur (impacte SSR des filtres initiaux et le partage de vues filtrées).
4. **Pull-to-refresh** mobile : à inclure en v1 ou différer ?
5. **Play TTS depuis la carte** du feed (sans ouvrir le détail) : souhaité ou réservé au détail/podcasts ?
6. **`size` de page** : confirmer 10 (aligné API) ou augmenter (ex. 20) pour réduire les rounds-trips sur desktop.

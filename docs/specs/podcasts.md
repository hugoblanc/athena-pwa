# Spec écran — Podcasts (liste)

## 1. Route & placement nav
- **Route** : `/podcasts` → fichier `src/app/podcasts/page.tsx` (Server Component).
- **Nav** : 3ᵉ entrée de `NAV_ENTRIES` (`src/components/shell/nav-config.ts`), label « Podcasts », icône `Music`. Présente en Sidebar desktop et TabBar mobile (shell déjà en place, non re-spécifié).
- Vit DANS l'`AppShell` ; le player singleton (`AudioPlayer`) est monté au niveau shell et survit à la navigation.
- Le détail (lecteur) est l'écran frère `/podcasts/:id` (hors périmètre ici).

## 2. Objectif (2-3 lignes)
Lister les podcasts générés par Athena (titre, source, durée), permettre une recherche plein-texte et la pagination « charger plus ». Un clic sur une carte lance la lecture immédiate dans le player singleton sans quitter la liste. La carte est aussi un point d'entrée vers le lecteur détaillé `/podcasts/:id`.

## 3. Données (API) — fonctions lib/api, server vs client, cache, pagination
- **Fonction** : `listPodcasts({ page, size, terms })` de `src/lib/api/podcast.ts` → renvoie `UnifiedPage<Podcast>` (adaptateur `fromMetaPage`). Champs exploités : `id`, `audioUrl`, `duration` (secondes, nullable), `status`, `content.title`, `content.meta_media.{title,logo,key}`, `content.image`, `content.publishedAt`.
- **Première page = Server Component** : la `page.tsx` appelle `listPodcasts({ page: 1, size: 20, terms })` côté serveur (SSR/ISR), où `terms` provient des `searchParams` (`/podcasts?q=...`). Cache `CACHE.list` (ISR 60 s) — déjà appliqué dans `podcast.ts`.
- **Recherche + pages suivantes = client** : un composant feuille `"use client"` (`PodcastList`) reçoit la première page en props (hydratation) puis appelle `listPodcasts` côté client pour :
  - recherche debouncée (≈ 350 ms) sur `terms` ;
  - bouton/scroll « charger plus » → `page + 1`, concat des `items`, stop quand `hasNext === false`.
  - Pour les appels client, créer un wrapper léger `searchPodcasts(terms, page)` OU passer par une route handler `GET /api/podcasts` qui réexpose `listPodcasts` (évite d'exposer `API_BASE_URL`/headers au navigateur). **[À VALIDER]** : appel direct depuis le client vs route handler proxy — recommandation : route handler proxy pour cache HTTP et cohérence headers.
- **Pagination** : 1-based, `size: 20`. Utiliser `hasNext` (et non recalculer) pour afficher/masquer « charger plus ».
- **Filtrage `status`** : n'afficher comme jouables que les podcasts `status === "COMPLETED"` avec `audioUrl` non vide. Les autres (pending/failed) sont soit masqués, soit affichés grisés non-cliquables. **[À VALIDER]** : masquer vs griser. Recommandation : masquer côté liste publique (un podcast non terminé n'a pas d'audio).
- Pas de `live` ici (liste non temps-réel).

## 4. Améliorations UX proposées
- **Barre de recherche intégrée à l'écran** (champ visible en haut de liste), pas seulement l'icône loupe de la TopBar mobile. Synchronisée à l'URL `?q=` (partageable, back-button friendly). [À VALIDER] : garder aussi le bouton loupe TopBar qui scrollerait/focus ce champ.
- **Lecture en un clic depuis la carte** : un bouton ▶ dédié sur la carte lance le player ; le reste de la carte (titre/zone) navigue vers `/podcasts/:id`. Sépare nettement « écouter tout de suite » et « voir le détail ».
- **État de lecture reflété sur la carte** : la carte du podcast en cours d'écoute affiche un état actif (bouton ▶ → ❚❚, accent `primary`, petit equalizer animé). Lu depuis `usePlayerStore` (`track.id`, `isPlaying`).
- **Durée humanisée** : `formatDuration(seconds)` → « 1 h 12 » / « 24 min » / « 8 min » (et non `mm:ss` brut comme `formatTime`). [À VALIDER] format exact.
- **Logo source** : afficher `content.meta_media.logo` en pastille à la place du dégradé générique quand dispo (cohérent avec le `PlayerCover`).
- **Compteur de résultats** discret sous la recherche (`total` de `UnifiedPage`) — utile pour valider une recherche.
- **Tri** [À VALIDER] : par défaut « plus récents d'abord » (l'API ne documente pas de paramètre `sort` pour `/podcast/list` — à confirmer côté back ; sinon pas de sélecteur de tri).

## 5. États
- **Loading (skeleton)** : SSR rend directement la 1ʳᵉ page (pas de skeleton initial). Pour la recherche/pagination client : skeleton de cartes (`PodcastCardSkeleton`, 6 items, blocs `bg-surface-2` animés `animate-pulse`) pendant le fetch ; pour « charger plus », spinner discret en bas plutôt que skeleton plein écran.
- **Empty (aucun podcast)** : illustration `Music` + « Aucun podcast pour l'instant ». Si `terms` non vide → « Aucun résultat pour “{terms}” » + bouton « Effacer la recherche ».
- **Error** : encart `bg-danger/10`, message « Impossible de charger les podcasts » + bouton « Réessayer » (relance le fetch). Côté serveur, `error.tsx` du segment.
- **Offline** : bannière « Hors ligne — liste possiblement non à jour » ; le podcast en cours de lecture continue (player singleton). Désactiver le bouton « charger plus » hors ligne. Détection via `navigator.onLine` + écouteurs `online/offline`.

## 6. Responsive — mobile (< lg) vs desktop (≥ lg)
- **Conteneur** : `mx-auto max-w-[640px] px-5 pt-4 lg:pt-6` (même gabarit colonne que le Fil).
- **Mobile (< lg)** : liste 1 colonne, cartes pleine largeur (`flex flex-col gap-3`). Recherche sticky sous la TopBar. Padding bas suffisant pour ne pas masquer la dernière carte derrière TabBar (84 px) + mini-player (`bottom-[84px]`).
- **Desktop (≥ lg)** : même colonne centrée 640 px (pas de grille multi-colonnes, cohérent avec le Fil). Le mini-player desktop est ancré en bas (`lg:left-[248px]`), prévoir `pb` suffisant.
- **[À VALIDER]** grille 2 colonnes desktop : non recommandé pour rester cohérent avec le Fil ; à confirmer.

## 7. Composants
**DS existants réutilisés :**
- `FilterChips` (`ui/filter-chips.tsx`) — si un filtre par source/catégorie est ajouté (optionnel, voir décisions).
- `Tag` (`ui/tag.tsx`) — badge « Podcast · {source} » sur la carte.
- `Button` / `IconButton` (`ui/button.tsx`) — actions (réessayer, charger plus).
- `usePlayerStore` + `Track` + `formatTime` (`player/player-store.ts`) — lancer la lecture (`play({ id, title, source, audioUrl, artwork, href })`), lire l'état actif.
- `AudioPlayer` (player singleton, déjà monté au shell — non instancié ici).
- Pattern de carte/conteneur inspiré de `ContentCard`/`page.tsx` (titres `font-display`, `border-border`, `shadow-elev-1`).

**NOUVEAUX composants à créer :**
1. `PodcastCard` (`src/components/content/podcast-card.tsx`, `"use client"`) — carte podcast : pastille logo/dégradé, titre (`line-clamp-2`), `Tag` source, durée humanisée, bouton ▶/❚❚ qui appelle `play()` et reflète l'état du store ; zone titre = `Link` vers `/podcasts/:id`. Props : `{ podcast: Podcast }`.
2. `PodcastList` (`src/components/content/podcast-list.tsx`, `"use client"`) — orchestrateur client : reçoit `initialPage: UnifiedPage<Podcast>`, gère recherche debouncée (sync URL `?q=`), pagination « charger plus », états loading/empty/error/offline. Rend la grille de `PodcastCard`.
3. `PodcastSearchBar` (`src/components/content/podcast-search-bar.tsx`, `"use client"`) — champ de recherche contrôlé (icône `Search`, bouton clear), debounce, compteur de résultats. Peut être fusionné dans `PodcastList`.
4. `PodcastCardSkeleton` (dans `podcast-card.tsx` ou `ui/`) — squelette d'une carte (`animate-pulse`, blocs `bg-surface-2`).
5. `formatDuration(seconds: number | null): string` — util dans `player-store.ts` ou `src/lib/format.ts` (« 1 h 12 », « 24 min », « —- » si null).

## 8. Interactions
- **Clic bouton ▶ sur la carte** : `usePlayerStore.play({ id: String(podcast.id), title: content.title, source: content.meta_media.title, audioUrl, artwork: content.image?.url ?? content.meta_media.logo, href: '/podcasts/'+id })`. Si la même piste est déjà active → `toggle()` (play/pause) au lieu de relancer.
- **Clic zone titre / carte** : navigation `Link` vers `/podcasts/:id` (lecteur détaillé, next/prev) — la lecture en cours continue.
- **Saisie recherche** : debounce 350 ms → met à jour `?q=` (router.replace, scroll préservé) → refetch page 1.
- **Bouton « Charger plus »** : fetch `page+1`, append. [À VALIDER] : remplacer par infinite scroll (IntersectionObserver) — recommandé sur mobile, bouton en fallback accessible.
- **Lecture audio** : entièrement déléguée au player singleton (MediaSession lockscreen déjà câblée). La liste ne possède pas de `<audio>`.
- **Effacer recherche** : bouton clear vide `?q=` et recharge la liste complète.

## 9. Accessibilité
- Bouton lecture : `aria-label` dynamique « Écouter {titre} » / « Mettre en pause {titre} » ; `aria-pressed` reflétant l'état de lecture.
- Carte : la zone-lien a un libellé clair ; ne pas imbriquer le bouton ▶ DANS le `Link` (deux cibles distinctes, pas de bouton dans un lien) — les poser côte à côte.
- Champ recherche : `<label>` associé (visually-hidden), `type="search"`, `role="searchbox"`, annonce du nombre de résultats via `aria-live="polite"`.
- États loading/empty/error annoncés avec `aria-live`/`role="status"`.
- Cibles tactiles ≥ 44 px (bouton ▶, clear).
- Equalizer animé décoratif → `aria-hidden`, respecter `prefers-reduced-motion` (figer l'animation).
- Focus visible sur cartes et boutons (hérité du DS), ordre de tab logique : recherche → cartes → charger plus.

## 10. Décisions ouvertes
1. **Appel client** : route handler proxy `/api/podcasts` (recommandé) vs appel direct `listPodcasts` depuis le navigateur ?
2. **Podcasts non terminés** (`status != COMPLETED`) : masquer (recommandé) ou afficher grisés ?
3. **Tri** : l'API `/podcast/list` accepte-t-elle un paramètre de tri ? Sinon ordre back par défaut, pas de sélecteur.
4. **Filtre par source/média** (`FilterChips`) : souhaité sur cette liste, ou recherche seule suffit ?
5. **Pagination** : infinite scroll vs bouton « Charger plus » (recommandé : infinite scroll + bouton fallback).
6. **Format durée** : « 1 h 12 » vs « 1h12 » vs « 72 min » ?
7. **Grille desktop** : colonne unique 640 px (recommandé, cohérent Fil) vs grille 2 colonnes ?
8. **Recherche TopBar** : la loupe de la TopBar mobile doit-elle router vers `/podcasts?q=` ou focus le champ in-page ?

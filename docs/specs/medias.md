# Spec écran — Médias (liste)

## 1. Route & placement nav
- **Route** : `/medias` (App Router : `app/medias/page.tsx`).
- **Placement nav** : entrée principale déjà présente dans `NAV_ENTRIES` (`src/components/shell/nav-config.ts`) → `{ href: "/medias", label: "Médias", short: "Médias", icon: LayoutGrid }`. Visible en 2e position dans la Sidebar (desktop) et la TabBar (mobile). Vit DANS le shell existant (`AppShell`), aucune modif du shell.
- **Rendu** : Server Component par défaut, **SSR/ISR** (page publique → SEO). C'est l'ex-`/home` de la webapp Angular (AUDIT §2 ligne 14, §7 point 2).

## 2. Objectif (2-3 lignes)
Présenter l'annuaire complet des médias libres agrégés par Athena, groupés par catégorie (`ListMetaMedia.title`). Chaque média est une carte (logo, titre, type) servant de **point d'entrée** vers son détail `/medias/:key`. Écran public, rendu serveur pour le référencement et la performance.

## 3. Données (API)
- **Fonction** : `getMetaMedias()` de `src/lib/api/meta-media.ts` → `GET /list-meta-media` → `ListMetaMedia[]` (eager : `{ id, title, metaMedias: MetaMedia[] }`).
- **Server vs client** : appel **serveur** dans `app/medias/page.tsx` (Server Component, pas de `"use client"`). Aucune donnée utilisateur, pas d'auth. Les feuilles interactives (recherche/filtre client) reçoivent la liste déjà résolue en props et sont `"use client"`.
- **Cache** : `CACHE.list` (ISR `revalidate: 60`) est déjà appliqué dans `getMetaMedias()`. **À surclasser en ISR plus long** : la liste des médias change rarement (ajout d'un média = événement éditorial). Proposition : exporter `export const revalidate = 3600` sur la page (1 h) — l'annuaire n'a pas besoin de fraîcheur 60 s. [À VALIDER] valeur du TTL.
- **Pagination** : **aucune**. `/list-meta-media` renvoie tout d'un bloc (pas d'enveloppe paginée), donc pas d'usage de `lib/api/pagination.ts` ici. Volume attendu faible (dizaines de médias).
- **live** : non applicable (pas de données temps réel).

## 4. Améliorations UX proposées
- **Recherche/filtre instantané côté client** : champ de recherche filtrant les cartes par titre de média en temps réel (pas d'appel réseau, la liste complète est déjà chargée). Justification : à mesure que le nombre de médias grandit, scroller devient pénible. Composant `"use client"` recevant la liste SSR en props. [À VALIDER] garder ou non vu le faible volume initial.
- **Filtre par type** (`Tout · Vidéos · Articles`) via `FilterChips` existant : mappe `MetaMediaType` (`YOUTUBE` → Vidéos, `WORDPRESS` → Articles). Cohérent avec le segment du Fil. [À VALIDER]
- **Compteur de contenus par média** : non disponible dans `/list-meta-media` → **ne pas l'afficher** en v1 (éviterait un N+1 d'appels). [À VALIDER] si désiré, nécessite un champ API.
- **Lien « Soutenir »** discret sur la carte quand `isDonationActivated && donation` : petit bouton/icône cœur ouvrant `donation` dans un nouvel onglet. Reprend la logique dons portée par `MetaMedia` (AUDIT §2 ligne 29). [À VALIDER] placement (carte vs détail uniquement).
- **Groupes en sections sticky** : titre de catégorie (`ListMetaMedia.title`) en en-tête `kicker` collant lors du scroll, pour se repérer. Amélioration de lisibilité par rapport à la liste plate du mobile.
- **Tri intra-groupe alphabétique** par `title` pour un annuaire prévisible.

## 5. États
- **loading** : page SSR → pas de spinner global au premier rendu. Pour les transitions, prévoir `app/medias/loading.tsx` avec **skeleton** : 2-3 en-têtes de section + grille de cartes fantômes (`bg-surface-2` animées, ratio carte média). Réutiliser le pattern skeleton du DS (§10 DESIGN_SYSTEM).
- **empty (global)** : si `getMetaMedias()` renvoie `[]` → état vide centré : icône `LayoutGrid`, titre « Aucun média disponible », sous-texte. Peu probable mais à gérer.
- **empty (recherche)** : si le filtre client ne matche rien → « Aucun média ne correspond à “{terme}” » + bouton « Effacer la recherche ».
- **error** : si l'appel API échoue → `app/medias/error.tsx` (`"use client"`, boundary) avec message « Impossible de charger les médias » + bouton **Réessayer** (`reset()`). Couleur `--danger` sur l'icône.
- **offline** : page dans l'app shell cachée par le SW ; si la donnée n'est pas en cache et hors-ligne → bandeau « Vous êtes hors ligne » et affichage de la dernière liste en cache si disponible (cache SW basique, AUDIT §6 « ne pas surinvestir »).

## 6. Responsive
- **Mobile (`< lg`)** : grille **2 colonnes** de cartes médias (gouttière écran 20 px, gap 12). En-têtes de section en pleine largeur. Barre de recherche + chips de filtre dans le flux, sous le titre de page. Cibles ≥ 44 px.
- **Desktop (`≥ lg`)** : contenu dans la colonne centrée du shell ; grille **3 colonnes** (gouttière 32 px, gap 16). Titre de page en `display-lg` (28 px). Hover sur carte : `translateY(-1px)` + bordure `--primary` (pattern `ContentCard` existant). Recherche/filtres alignés à droite du titre.
- Le shell (Sidebar/TabBar) est inchangé — voir DESIGN_SYSTEM §9.

## 7. Composants
**DS existants réutilisés**
- `Tag` (`src/components/ui/tag.tsx`) — badge type média (`VIDÉO` / `ARTICLES`), variante `orange` possible.
- `FilterChips` (`src/components/ui/filter-chips.tsx`) — segment de filtre par type (si amélioration retenue).
- `Button` (`src/components/ui/button.tsx`) — bouton « Réessayer », « Effacer », « Soutenir ».
- Tokens/patterns DS : surfaces, bordures, ombres `shadow-elev-1`, radius, typo (`display-lg`, `kicker`, `card-title`).
- `AppShell` (déjà en place) — l'écran vit dedans, non re-spécifié.

**NOUVEAUX composants à créer**
1. `MediaCard` (`src/components/content/media-card.tsx`, Server-compatible) — carte d'un média : logo carré arrondi (`next/image`, fallback initiale sur dégradé orange, DESIGN_SYSTEM §10), `card-title` (clamp 1 ligne), `Tag` type, lien englobant vers `/medias/[key]`. Distinct de `ContentCard` (orienté thumb 88×88 + contenu, pas média).
2. `MediaGrid` (`src/components/content/media-grid.tsx`, `"use client"`) — wrapper client recevant `ListMetaMedia[]` ; gère état recherche + filtre type, rend les sections groupées et la grille de `MediaCard`, plus les états empty-recherche. Si recherche/filtre non retenus, ce composant reste serveur et se réduit au rendu des sections.
3. `MediaSectionHeader` (`src/components/content/media-section-header.tsx`) — en-tête de groupe (`kicker` sticky) affichant `ListMetaMedia.title`.
4. (optionnel) `MediaSearchBar` (`"use client"`) — champ de recherche contrôlé ; sinon inliné dans `MediaGrid`.

## 8. Interactions
- **Clic sur une carte média** → navigation `Link` vers `/medias/[key]` (détail du média, AUDIT §7 point 7).
- **Saisie dans la recherche** → filtrage client instantané (debounce léger ~100 ms inutile vu le filtrage local, optionnel).
- **Clic sur un chip de type** → filtre la grille (sélection unique, comportement `FilterChips`).
- **Clic « Soutenir »** (si activé) → `window.open(donation, "_blank")` (remplace l'InAppBrowser natif, AUDIT §2 ligne 32) ; `stopPropagation` pour ne pas déclencher le lien de la carte.
- **Pas de lecture audio** sur cet écran (le player global du shell n'est pas sollicité ici).
- Navigation clavier : cartes focusables, ordre logique groupe par groupe.

## 9. Accessibilité
- Chaque carte = **un seul lien englobant** avec libellé accessible « Ouvrir {média.title} » (a11y, pattern DS §7.2).
- Logos : `alt=""` décoratif si le titre est déjà dans le lien ; sinon `alt="Logo {média.title}"`. Fallback initiale a un `aria-hidden`.
- Bouton « Soutenir » : `aria-label="Soutenir {média.title}"` (icône seule).
- Champ recherche : `<label>` associé (visuellement masqué) + `aria-controls` vers la grille ; résultat annoncé via `aria-live="polite"` (« N médias trouvés »).
- En-têtes de section = vraies balises (`<h2>`) pour la structure du document (SEO + lecteurs d'écran).
- Focus clavier : anneau orange 2 px sur cartes, chips, boutons (DESIGN_SYSTEM §12). Contraste AA, orange texte → `brand-700` en clair.
- `prefers-reduced-motion` : désactive le `translateY` au hover.

## 10. Décisions ouvertes
1. **Recherche + filtre par type** : à conserver dès la v1 malgré le faible volume de médias, ou simple liste groupée statique ? (impacte si `MediaGrid`/`MediaSearchBar` sont client ou serveur).
2. **TTL ISR** : `revalidate` à 3600 s (1 h) acceptable pour l'annuaire, ou garder 60 s du `CACHE.list` par défaut ?
3. **Lien « Soutenir » sur la carte** : afficher le don au niveau de la carte liste, ou le réserver à l'écran détail `/medias/:key` pour garder la grille épurée ?
4. **Compteur de contenus par média** : souhaité ? Si oui, il faut un champ côté API (`/list-meta-media`) car le calculer côté front = N+1 appels, non envisageable.
5. **Mapping libellés de type** : `YOUTUBE → « Vidéos »` et `WORDPRESS → « Articles »` — libellés FR à confirmer (le front mobile mentionnait aussi un type `VIDEO` absent de l'API, AUDIT §4 ligne 121).

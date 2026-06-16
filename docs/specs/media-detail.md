# Spec écran — Détail média

## 1. Route & placement nav

- **Route** : `/medias/:key` (App Router : `app/medias/[key]/page.tsx`).
- **Hors navigation principale** : écran de contenu accessible depuis la liste `/medias` (clic sur une carte média) ou depuis un `ContentCard` du feed (clic sur le badge/logo source — [À VALIDER], cf. §8). Pas d'item dans la Sidebar/TabBar.
- Vit **dans le shell** existant (`AppShell`) : colonne centrée `max-w-[640px]` desktop, gouttières 20px mobile / 32px desktop. Ne re-spécifie pas le shell.
- `:key` = `MetaMedia.key` (ex. `blast`, `legrandcontinent`). Sert à la fois de paramètre API et de clé d'identité média.

## 2. Objectif (2-3 lignes)

Présenter un média libre (en-tête : logo, titre, type, lien don) puis dérouler **tous ses contenus** en liste paginée avec infinite scroll. Source de données = **API Athena** (`getContentByMediaKey`), jamais le site WordPress en direct — corrige la dette CORS/cache de l'AUDIT (§3 ligne 15, §5). C'est l'écran « page d'un média » qui transforme l'agrégateur en porte d'entrée éditoriale par source.

## 3. Données (API) — fonctions lib/api, server vs client, cache, pagination

**En-tête média** (Server Component) :
- Pas d'endpoint « média par key » dédié dans l'API. On dérive le `MetaMedia` depuis `getMetaMedias()` (`lib/api/meta-media.ts`, `GET /list-meta-media`, `CACHE.list` = ISR 60s), puis on `find` le média dont `m.key === params.key` à plat sur tous les `metaMedias` des groupes. → `{ title, logo, type, url, donation, isDonationActivated }`.
  - [À VALIDER] dépendance sur le payload complet `list-meta-media` juste pour un en-tête : acceptable (public, caché ISR, petit). Sinon prévoir un endpoint `GET /meta-media/:key` côté API (hors périmètre).
  - Si `find` échoue → `notFound()` (404 Next).

**Première page de contenus** (Server Component, SSR/ISR pour SEO + first paint) :
- `getContentByMediaKey(key, 1)` (`lib/api/content.ts`, `GET /content/mediakey/:key/page/:page`, `CACHE.list` = ISR 60s, `PAGER_SIZE=10`).
- Retour : `UnifiedPage<Content>` → `{ items, page, hasNext, total, totalPages }` (adaptateur `fromContentPage`, `lib/api/pagination.ts`).

**Pages suivantes — infinite scroll** (Client Component) :
- Server Action ou Route Handler qui ré-appelle `getContentByMediaKey(key, page+1)` et renvoie `UnifiedPage<Content>`. [À VALIDER] préférer une **Server Action** `loadMoreContent(key, page)` (typée, pas de route handler à câbler) appelée depuis le composant client d'infinite scroll.
- `hasNext` pilote l'arrêt du scroll. Pagination **1-based** (cohérent avec l'API content).

**Cache** : list = ISR 60s (en-tête + pages). Pas de `live` ici (le contenu d'un média n'est pas temps réel). Detail non utilisé sur cet écran.

## 4. Améliorations UX proposées — concrètes, justifiées

- **En-tête média riche** : logo (carré arrondi, fallback initiale sur dégradé orange), titre `display`, sous-ligne méta (`type` → « Vidéos » / « Articles », + `total` de contenus si dispo via `UnifiedPage.total`). Justifié : donne une identité à la page, pas juste une liste nue.
- **Bouton « Soutenir » conditionnel** : si `isDonationActivated && donation`, afficher un bouton `secondary` (icône `Heart`) ouvrant `donation` dans un nouvel onglet. Récupère la logique « dons » de l'AUDIT (#17) sans le compteur de vues. [À VALIDER] placement (en-tête vs menu `...`).
- **Bouton « Activer les notifications » pour ce média** [À VALIDER] : raccourci vers les préférences push par média (feature #13 de l'AUDIT). Affiché en `ghost` avec icône `Bell`. À masquer tant que le push n'est pas livré — placeholder désactivé acceptable.
- **Filtre type de contenu** [À VALIDER] : un média est soit YOUTUBE soit WORDPRESS (mono-type d'après `MetaMedia.type`), donc un filtre Vidéos/Articles est **inutile la plupart du temps**. Ne pas l'ajouter par défaut ; ne le câbler que si un même `key` mélange les types (à confirmer côté données).
- **Lien « Voir le site original »** : `m.url` en lien discret dans l'en-tête (icône `ExternalLink`). Transparence sur la source.
- **Compteur de résultats** : « N contenus » sous le titre quand `total` connu.
- **Skeleton réutilisant la structure exacte des cartes** (anti-CLS), cf. §5.

## 5. États

- **Loading (SSR)** : `loading.tsx` du segment → skeleton en-tête (bloc logo 56px + barres titre/méta `bg-surface-2 animate-pulse`) + 6 skeletons de `ContentCard` (thumb 88px + 2 barres titre + 1 barre méta). Mêmes dimensions que le rendu final.
- **Loading (infinite scroll)** : 3 skeletons de carte en bas de liste pendant le fetch de la page suivante + sentinelle.
- **Empty** : média trouvé mais `items.length === 0` → bloc centré, icône `Inbox`, texte « Aucun contenu publié pour le moment. » + lien « Voir le site du média » (`m.url`).
- **Error (en-tête introuvable)** : `key` absent de `list-meta-media` → `notFound()` (page 404 globale).
- **Error (fetch contenus)** : `error.tsx` du segment → message « Impossible de charger les contenus » + bouton `reset()` (« Réessayer »). Erreur sur page suivante (infinite scroll) → bandeau inline non bloquant avec « Réessayer » (garde les items déjà chargés).
- **Offline** : si app shell servi par SW mais fetch échoue → bandeau « Hors ligne — contenus indisponibles ». Pas de cache offline du contenu en v1 (angle mort assumé AUDIT §6).

## 6. Responsive — mobile (< lg) / desktop (≥ lg)

- **Mobile (< lg)** : pleine largeur, gouttière 20px. En-tête compact (logo 48px à gauche, titre + méta à droite ; boutons d'action en rangée scrollable sous le titre). Liste de cartes pleine largeur, gap 12px.
- **Desktop (≥ lg)** : colonne centrée `max-w-[640px]`. En-tête plus aéré (logo 56–64px, titre `display-lg` 28px). Cartes avec hover (`-translate-y-px` + `border-primary`, déjà dans `ContentCard`). Boutons d'action alignés à droite du titre.
- Bascule pilotée par le shell, pas de breakpoint custom à réintroduire ici hormis l'en-tête.

## 7. Composants — DS existants réutilisés + NOUVEAUX

**Réutilisés (ne pas réinventer)** :
- `ContentCard` (`components/content/content-card.tsx`) — carte de liste. Mapper `Content` → `ContentCardData` : `href = '/content/' + m.key + '/' + c.contentId`, `tag = TYPE + ' · ' + m.title` (ex. `VIDÉO · BLAST`), `title = c.title`, `meta = date formatée FR`, `image = c.image?.url`, `isVideo = c.contentType === 'YOUTUBE'`.
- `Tag` (`components/ui/tag.tsx`) — déjà utilisé dans la carte ; réutilisable dans l'en-tête pour le badge type.
- `Button` (`components/ui/button.tsx`) — boutons d'action en-tête (variantes `secondary` / `ghost`).
- `AppShell` (`components/shell/app-shell.tsx`) — conteneur (implicite via layout).
- Icônes `lucide-react` : `Heart`, `Bell`, `ExternalLink`, `Inbox`, `Play` (déjà dans la carte).

**Nouveaux à créer** :
1. **`MediaHeader`** (`components/content/media-header.tsx`, server-friendly) — en-tête média : logo (avec fallback initiale dégradé), titre, badge type, compteur de contenus, slot d'actions (don / notif / lien site).
2. **`MediaContentList`** (`components/content/media-content-list.tsx`, `"use client"`) — liste + infinite scroll : reçoit `initialPage: UnifiedPage<Content>` + `mediaKey` + `mediaTitle`, gère l'état des pages chargées, l'`IntersectionObserver` (sentinelle), le `loadMore` (Server Action), les skeletons de bas de liste et l'erreur inline.
3. **`InfiniteSentinel`** (`components/ui/infinite-sentinel.tsx`, `"use client"`) — wrapper `IntersectionObserver` générique réutilisable (feed, podcasts, lois) : appelle `onReach` quand visible, prop `disabled` quand `!hasNext` ou loading. [À VALIDER] mutualiser ici vs dupliquer dans chaque écran.
4. **`ContentCardSkeleton`** (`components/content/content-card-skeleton.tsx`) — skeleton iso-dimension de `ContentCard` (réutilisé par feed/médias).

## 8. Interactions

- **Clic carte** : navigue vers `/content/:key/:contentId` (détail contenu). Toute la carte est un `<Link>` (déjà géré par `ContentCard`).
- **Infinite scroll** : sentinelle en bas → charge la page suivante via Server Action ; stop quand `hasNext === false`. Throttle/garde anti-double-fetch (flag `loading`).
- **Bouton « Soutenir »** : `window.open(donation, '_blank', 'noopener')`.
- **Bouton « Voir le site »** : ouvre `m.url` nouvel onglet.
- **Bouton « Notifications »** [À VALIDER] : ouvre les préférences du média (push) — désactivé tant que push non livré.
- **Pas de lecture audio sur cet écran** : le player audio TTS est porté par le détail contenu / podcast. (Évolution possible : bouton « écouter » par carte → enqueue dans le player singleton via `player-store` — hors périmètre v1.)
- **Scroll restoration** : conserver la position au retour depuis un détail (comportement Next par défaut ; vérifier que l'infinite scroll réhydrate les pages déjà chargées — sinon accepter le reset en v1).
- **Entrée depuis le feed** [À VALIDER] : rendre le logo/source d'un `ContentCard` cliquable vers `/medias/:key` — nécessiterait d'adapter `ContentCard` (lien imbriqué interdit). Reporté ; pour l'instant accès via `/medias`.

## 9. Accessibilité

- En-tête : `<h1>` = titre du média (un seul h1 par page). Cartes : `<h3>` (déjà dans `ContentCard`).
- Logo média : `alt` = titre du média (ou `alt=""` si purement décoratif à côté du titre texte).
- Boutons icône-seule (don, notif, lien) : `aria-label` explicite (« Soutenir <média> », « Voir le site de <média> »).
- Infinite scroll : annoncer le chargement via `aria-live="polite"` (« Chargement de contenus supplémentaires »). Fin de liste annoncée (« Tous les contenus sont affichés »).
- Sentinelle non focusable / `aria-hidden` ; ne pas casser l'ordre de tabulation.
- Liens de cartes : focus clavier visible (anneau orange 2px, déjà au DS). Cibles ≥ 44px respectées par la hauteur de carte.
- `prefers-reduced-motion` : skeletons en `animate-pulse` à neutraliser si réduit.

## 10. Décisions ouvertes

1. **En-tête média** : se contenter de dériver depuis `getMetaMedias()` (find par key), ou demander un endpoint API `GET /meta-media/:key` ? (impacte le couplage et le poids du fetch).
2. **Bouton notifications par média** : l'afficher désactivé maintenant (placeholder) ou attendre la livraison du push (#13) ?
3. **Filtre type de contenu** : confirmer qu'un `key` est strictement mono-type (YOUTUBE **ou** WORDPRESS). Si oui, on retire le filtre définitivement.
4. **Entrée depuis le feed** : faut-il rendre la source d'un `ContentCard` cliquable vers `/medias/:key` (refonte du composant carte pour éviter le lien imbriqué) ?
5. **`InfiniteSentinel` mutualisé** : créer un composant générique partagé (feed/podcasts/lois) maintenant, ou local à cet écran et factoriser plus tard ?
6. **Bouton « écouter » par carte** (enqueue player) : in/out du périmètre v1 de cet écran ?

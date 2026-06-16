# Spec écran — Détail contenu

## 1. Route & placement nav

- **Route** : `/content/[key]/[id]` (App Router, segment dynamique double `key` = `mediaKey`, `id` = `contentId` WordPress/YouTube).
- **Hors navigation principale** (pas d'entrée Sidebar/TabBar) : écran de destination atteint depuis le Feed (`/`), le détail média (`/medias/[key]`), une notification push (deep-link `/content/:key/:id`) ou une page de partage `/share/:key/:contentId`.
- Vit **dans** le shell adaptatif existant (Sidebar desktop / TabBar mobile). Contenu éditorial contraint à `max-w-[640px]` centré (cf. DESIGN_SYSTEM §4).
- **Server Component par défaut** (gain SEO + OG tags). Seules les feuilles interactives sont `"use client"` (cf. §7).

## 2. Objectif (2-3 lignes)

Afficher un article ou une vidéo d'un média libre : titre, source, image/embed, corps HTML sanitizé, avec écoute de la version audio TTS et partage natif. C'est la page de lecture finale — elle doit s'effacer derrière le contenu (lisibilité maximale, confort de lecture, mode nuit déjà géré par le thème global).

## 3. Données (API) — fonctions lib/api, server vs client, cache, pagination

| Donnée | Fonction `lib/api` | Endpoint | Où | Cache |
|---|---|---|---|---|
| Détail du contenu (HTML) | `getContent(id)` (`content.ts`) | `GET /content/:id` | **Server** (page + `generateMetadata`) | `CACHE.detail` (ISR 300 s) |
| Résolution `key`+`contentId` → `id` numérique | **NOUVEAU** `getIdFromContentIdAndMediaKey(key, contentId)` à ajouter dans `content.ts` (`GET /content/get-id-from-content-id-and-media-key/:key/:contentId`) | — | **Server** | `CACHE.detail` |
| Métadonnées OG (image/titre/url) | `getShareableContent(key, contentId)` (`content.ts`) | `GET /content/get-shareable-content/:key/:contentId` | **Server** (`generateMetadata`) | `CACHE.detail` |
| URL audio TTS | `getAudioContentUrl(id)` (`content.ts`) → `{ url }` | `GET /content/get-audio-content-url-by-id/:id` | **Client** (au clic « Écouter », lazy) | `CACHE.detail` |
| Podcast lié (s'il existe) | `getPodcastByContent(contentId)` (`podcast.ts`) | `GET /podcast/content/:contentId` | **Server** (optionnel, parallèle) | `CACHE.detail` |

**Résolution de l'`id`** : l'URL porte `key`/`contentId` (forme partageable), mais `getContent` attend l'`id` numérique interne. Deux stratégies — **[À VALIDER]** :
- **(a) recommandée)** : `getContent` accepte déjà `string | number`. Tester si l'API résout le `contentId` directement via `/content/:id`. Si oui, un seul appel suffit.
- **(b) fallback)** : `getIdFromContentIdAndMediaKey(key, contentId)` puis `getContent(id)`. Coût = 1 appel de plus, mais robuste. À câbler tant que (a) n'est pas confirmé par l'audit.

**Pas de pagination** (écran de détail). Aucune donnée `live`. Tous les fetchs serveur sont parallélisés (`Promise.all`) dans la page.

**Sanitization HTML** : le `description`/`plainText` est du HTML brut WordPress. Sanitizer **côté serveur** avec un allowlist (`isomorphic-dompurify` ou `sanitize-html`) avant rendu via `dangerouslySetInnerHTML`. **[À VALIDER]** : confirmer que l'API renvoie déjà du HTML nettoyé ; sinon ce sanitizer est obligatoire (XSS).

**YouTube** : si `contentType === "YOUTUBE"`, ne pas rendre de HTML mais un `<iframe>` lite-embed (extraire le videoID). **[À VALIDER]** : le champ videoID n'est pas dans le type `Content` — vérifier comment le récupérer (`description` ? URL ? champ dédié). Fallback = lien vers `originalUrl`.

## 4. Améliorations UX proposées

1. **Lecteur audio TTS intégré au player global** [recommandé] — bouton « Écouter l'article » sous le titre. Au clic, `getAudioContentUrl(id)` puis `usePlayerStore.play({ id, title, source, audioUrl, artwork: image.url, href: '/content/:key/:id' })`. Réutilise le player singleton existant → lecture en background + MediaSession + lockscreen, sans nouveau composant de lecture. Le bouton montre un spinner pendant le fetch d'URL, puis bascule en play/pause synchronisé au store.
2. **Barre de progression de lecture (reading progress)** [À VALIDER] — fine barre orange en haut du contenu indiquant l'avancée du scroll. Léger, signature « contenu d'abord ». Désactivée si `prefers-reduced-motion`.
3. **Confort de lecture** [recommandé] — le mode nuit est déjà global (`next-themes`). Ajouter un **réglage de taille de texte** (A−/A, 3 paliers via classe sur le conteneur, persistée en `localStorage`) accessible depuis le menu d'actions. Améliore l'accessibilité sans dupliquer un toggle thème local.
4. **Partage natif Web Share API** [recommandé] — bouton Partager → `navigator.share({ title, url, text })` avec l'URL canonique `/share/:key/:contentId` (page OG dédiée). Fallback desktop (pas de `navigator.share`) : menu copier-le-lien + ouvrir le lien original. L'image OG vient de `getShareableContent`.
5. **Lien « Lire la source originale »** [recommandé] — `originalUrl` ouvert dans un nouvel onglet (`target="_blank" rel="noopener"`), valorise le média libre source.
6. **Bloc « Continuer en podcast »** [À VALIDER] — si `getPodcastByContent` renvoie un podcast, afficher une carte d'accès au lecteur `/podcasts/:id` (dialogue audio enrichi vs TTS brut).
7. **Estimation du temps de lecture** [À VALIDER] — calculée serveur depuis le `plainText` (~200 mots/min), affichée dans la méta. Petit repère utile, faible coût.

## 5. États

- **Loading** (navigation SPA / `loading.tsx`) : **skeleton** — bandeau kicker + barre titre (2 lignes), image 16:9 `bg-surface-2` animée, 6–8 lignes de texte grises de largeurs variables (`bg-surface-2 rounded`). Réutilise le pattern skeleton du feed.
- **Audio loading** : spinner sur le bouton « Écouter » uniquement (le reste de la page reste interactif).
- **Empty** : peu probable (détail). Si `description`/`plainText` vide → afficher uniquement titre + image + lien source originale + un message discret « Contenu disponible sur le site du média ».
- **Error** : `error.tsx` du segment — carte centrée « Contenu introuvable » + bouton Réessayer + lien retour au Feed. `getContent` 404 → `notFound()` (page 404 Next).
- **Offline** : si le contenu a été visité, servi par le cache SW (app shell + dernières pages). Sinon bandeau « Hors connexion — ce contenu n'est pas en cache ». L'audio TTS nécessite le réseau → bouton Écouter désactivé hors-ligne avec tooltip.

## 6. Responsive — mobile (< lg) / desktop (≥ lg)

- **Contenu** : largeur fluide avec gouttière 20 px en mobile, contraint à `max-w-[640px]` centré en desktop (gouttière 32 px). Identique des deux côtés sinon (un seul rendu).
- **Image hero** : pleine largeur 16:9 en mobile (bords à bords ou arrondie selon le conteneur) ; en desktop reste dans la colonne 640 px.
- **Barre d'actions** (Écouter / Partager / Taille texte / Source) : en mobile, **barre sticky en bas** au-dessus de la TabBar (ou sous le titre, sticky top) pour rester accessible au pouce ; en desktop, rangée d'actions sous le titre + actions secondaires dans un `Menu`.
- **Player audio** : géré par le composant global existant (flottant au-dessus de la TabBar en mobile, ancré bas de colonne en desktop) — **ne pas re-spécifier**.
- **Typo** : titre `display` (22 px) en mobile, `display-lg` (28 px) en desktop.

## 7. Composants — DS existants réutilisés + NOUVEAUX

**Réutilisés (ne pas réinventer)** :
- `Tag` (`ui/tag.tsx`) — badge `TYPE · SOURCE` (ex. `VIDÉO · BLAST`), variante `orange` pour le kicker.
- `Button` (`ui/button.tsx`) — variantes `primary` (Écouter), `ghost`/`secondary` (Partager, Source).
- `usePlayerStore` + `AudioPlayer` (`player/`) — lecture TTS via le singleton global (`play(track)`), aucun lecteur local à créer.
- `Avatar` / logo source (pattern existant) pour le logo média.
- Shell adaptatif (`shell/`) — conteneur, aucune modif.

**NOUVEAUX composants à créer** :
1. **`ContentHeader`** (`components/content/content-header.tsx`, server) — kicker source + logo média + titre + méta (date, temps de lecture). Rendu serveur.
2. **`ContentBody`** (`components/content/content-body.tsx`, server) — rend le HTML sanitizé via `dangerouslySetInnerHTML` dans un wrapper `prose`-like maison (styles éditoriaux : titres, listes, blockquotes, liens orange, images responsives). Branche aussi le rendu YouTube iframe selon `contentType`.
3. **`ListenButton`** (`components/content/listen-button.tsx`, `"use client"`) — bouton « Écouter l'article » : fetch lazy `getAudioContentUrl`, pousse la piste dans `usePlayerStore`, état loading/play/pause synchronisé au store (highlight si la piste courante = ce contenu).
4. **`ShareButton`** (`components/content/share-button.tsx`, `"use client"`) — Web Share API + fallback copier-le-lien (Toast Base UI).
5. **`ReadingSettings`** (`components/content/reading-settings.tsx`, `"use client"`) — menu/popover taille de texte (A−/A/A+) persistée `localStorage`, applique une classe au conteneur de lecture.
6. **`ReadingProgressBar`** (`components/content/reading-progress-bar.tsx`, `"use client"`) [À VALIDER avec amélioration #2] — barre de progression de scroll, respecte `prefers-reduced-motion`.
7. **`ContentDetailSkeleton`** (`components/content/content-detail-skeleton.tsx`, server) — squelette de chargement (utilisé dans `loading.tsx`).

## 8. Interactions

- **Clic « Écouter »** : déclenche fetch URL audio → `play(track)`. Si la piste du contenu est déjà active, le bouton agit comme play/pause (`toggle`). Le player flottant apparaît et persiste à la navigation.
- **Clic « Partager »** : `navigator.share` (mobile) ; desktop → menu copier/ouvrir. Toast de confirmation à la copie.
- **Clic « Lire la source »** : ouvre `originalUrl` dans un nouvel onglet.
- **Taille de texte** : 3 paliers, application instantanée, persistance locale.
- **Vidéo YouTube** : clic sur le poster → charge l'iframe (lite-embed, évite le chargement initial du player YouTube).
- **Navigation retour** : bouton/route retour vers l'origine (Feed ou détail média) ; gérer le « back » natif.
- **Deep-link push / partage** : l'URL résout directement le contenu (résolution `key`/`contentId` côté serveur, cf. §3).
- **Lecture audio** : entièrement déléguée au player global (background, MediaSession, lockscreen) — pas de logique audio locale dans l'écran.

## 9. Accessibilité

- Hiérarchie de titres correcte : `<h1>` = titre du contenu unique ; le HTML injecté ne doit pas réintroduire de `<h1>` (rétrograder en `<h2>+` au sanitize si besoin).
- HTML sanitizé strict (allowlist balises/attributs), `rel="noopener noreferrer"` forcé sur les liens externes, `target="_blank"` annoncé.
- Bouton « Écouter » : `aria-label` explicite, `aria-pressed`/état lecture annoncé ; le titre courant du player est déjà sous `aria-live` (player global).
- Images du corps : `alt` préservé si présent, sinon `alt=""` (décoratif). Image hero : `alt` = titre.
- Cibles ≥ 44 px sur toutes les actions (barre mobile), focus clavier visible (anneau orange 2 px).
- Iframe YouTube : `title` descriptif.
- `prefers-reduced-motion` respecté (progress bar, transitions).
- Contraste AA du texte éditorial sur `--surface` ; liens orange = `brand-700` en mode clair.

## 10. Décisions ouvertes

1. **Résolution de l'id** : `/content/:id` accepte-t-il le `contentId` brut, ou faut-il systématiquement passer par `get-id-from-content-id-and-media-key` ? (impacte le nombre d'appels serveur).
2. **HTML déjà sanitizé côté API ?** Sinon, valider la lib de sanitization serveur (`isomorphic-dompurify` vs `sanitize-html`).
3. **Vidéos YouTube** : où trouver le `videoID` (champ absent du type `Content`) ? Rendu iframe vs simple lien vers `originalUrl` ?
4. **Bloc « Continuer en podcast »** : on l'ajoute (appel `getPodcastByContent` systématique) ou on l'omet en v1 ?
5. **Barre de progression de lecture + réglage taille de texte** : retenus pour la v1 ou repoussés (améliorations UX optionnelles) ?
6. **Temps de lecture estimé** : affiché ou non (dépend de la fiabilité du `plainText`) ?
7. **URL canonique de partage** : pointe-t-on vers `/share/:key/:contentId` (page OG) ou directement vers `/content/:key/:id` ?

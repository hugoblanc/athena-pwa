# Spec écran — Lecteur podcast

## 1. Route & placement nav

- **Route** : `/podcasts/[id]` (App Router — `src/app/podcasts/[id]/page.tsx`). `id` = identifiant numérique du podcast (`Podcast.id`).
- **Placement nav** : écran de contenu **hors nav principale** (cf. AUDIT §7, item 9). On y arrive depuis la liste `/podcasts`, depuis le mini-player (clic sur le titre → `track.href`), ou depuis un détail de contenu lié. La Sidebar/TabBar reste affichée (l'écran vit dans le shell) ; l'entrée active en nav reste « Podcasts ».
- **Singleton player** : le mini-player global (`AudioPlayer` monté dans l'AppShell) reste présent en bas. Cet écran est la **page détail + Now Playing inline**, distincte du mini-player flottant — il ne re-monte aucun `<audio>`, il pilote le `usePlayerStore` existant.

## 2. Objectif (2-3 lignes)

Présenter un podcast (titre, source, durée, contenu source dont il est issu) et permettre sa lecture continue via le player singleton avec MediaSession. Donner accès à la navigation séquentielle (précédent/suivant) sans quitter l'écran, et renvoyer vers le contenu d'origine. C'est la page « riche » du podcast, complémentaire de la barre flottante.

## 3. Données (API)

| Donnée | Fonction `lib/api` | Server/Client | Cache |
|---|---|---|---|
| Détail du podcast (avec `content`) | `getPodcast(id)` (`podcast.ts`) | **Server** (RSC) | `CACHE.detail` (ISR 300 s) |
| Podcast suivant (préfetch lien) | `getNextPodcast(id)` (`podcast.ts`) | **Server** | `CACHE.detail` |
| Podcast précédent (préfetch lien) | `getPreviousPodcast(id)` (`podcast.ts`) | **Server** | `CACHE.detail` |

- **Server Component par défaut** : `page.tsx` est un RSC `async` qui `await getPodcast(id)`. Les appels next/previous se font **en parallèle** (`Promise.all`) avec `getPodcast` pour pré-résoudre les cibles des boutons (URL + label `content.title`). Tolérer leur échec (404 en bord de liste) → `next`/`previous` = `null`.
- **Pas de pagination** sur cet écran (détail unitaire). La liste `/podcasts` utilise `listPodcasts` ; non concerné ici.
- **Pas de cache `live`** : un podcast est un asset figé (audio généré). `detail` (ISR 5 min) suffit ; si `status !== 'completed'` on ne met pas en cache long → voir §5 (état génération en cours, basculer en `CACHE.live` pour ce cas via un re-fetch client léger). [À VALIDER]
- **Feuille interactive `"use client"`** : seul le bloc de contrôle lecture (`PodcastPlayPanel`) est client — il lit `usePlayerStore` et appelle `play()` avec un `Track`. Le reste de la page (header, méta, contenu lié, nav prev/next) est servi.
- **Mapping `Podcast → Track`** (player-store) :
  - `id: String(podcast.id)`
  - `title: podcast.content?.title ?? 'Podcast Athena'`
  - `source: podcast.content?.meta_media?.title ?? 'Athena'`
  - `audioUrl: podcast.audioUrl`
  - `artwork: podcast.content?.image?.url`
  - `href: '/podcasts/' + podcast.id`
- **Durée** : `podcast.duration` (secondes, nullable) → `formatTime` (déjà exporté par `player-store.ts`).
- **Lien contenu source** : `content.contentId` + `content.meta_media.key` → route `/content/[key]/[id]` (détail contenu). Construire `/content/${meta_media.key}/${content.contentId}`.

## 4. Améliorations UX proposées

- **Now Playing inline riche** (vs simple barre flottante) : grande pochette (artwork ou fallback dégradé orange + icône Music, cohérent avec `PlayerCover`), titre `display`, source avec logo média, durée totale. Justification : la barre flottante est volontairement compacte ; la page détail mérite l'affichage complet.
- **Scrubber complet sur la page** (`Slider` DS) avec temps écoulé / restant, actif **uniquement quand cette piste est la piste courante** du store. Si une autre piste joue, le panneau montre un bouton « Lire ce podcast » qui remplace la piste. Justification : évite l'ambiguïté entre « le podcast affiché » et « ce qui joue réellement ».
- **Boutons -15s / +30s** sur la page (réutilise la logique `requestSeek` déjà présente dans `audio-player.tsx`). Justification : confort d'écoute long-format.
- **Sélecteur de vitesse 0.75×–2×** (`Select` Base UI) — manquant dans le store actuel. [À VALIDER : nécessite d'ajouter `playbackRate` au `player-store` et de l'appliquer sur `<audio>`. Petit chantier store, voir §10.]
- **Navigation prev/next contextualisée** : afficher le **titre** du podcast précédent/suivant (pas juste des flèches), avec préfetch RSC. Justification : transforme la nav en mini-fil d'écoute. Désactiver visuellement si `null`.
- **« Aller au contenu source »** : carte/lien vers `/content/[key]/[id]` montrant le contenu (article/vidéo) dont le podcast est la version audio. Justification : le podcast est dérivé d'un contenu — fermer la boucle.
- **Transcription / dialogue dépliable** : `podcast.dialogueText` affiché dans un `Collapsible` (Base UI) « Voir la transcription ». Justification : accessibilité + SEO (texte indexable côté serveur). [À VALIDER : qualité/longueur du `dialogueText`.]
- **Auto-play à l'arrivée** : NE PAS auto-jouer (politique navigateurs + respect utilisateur). Bouton lecture explicite. Si on arrive via le mini-player (piste déjà courante), refléter l'état en cours sans relancer.

## 5. États

- **Loading (skeleton)** : `loading.tsx` du segment — pochette carrée `bg-surface-2 animate-pulse`, lignes titre/source/durée grises, barre de progression placeholder, blocs prev/next et contenu lié en skeleton. Réutilise le motif skeleton `bg-surface-2` du DS (§10 DESIGN_SYSTEM).
- **Empty** : sans objet (un détail existe ou n'existe pas). Pas d'état empty distinct.
- **Error / 404** : `getPodcast` échoue ou renvoie introuvable → `not-found.tsx` (« Ce podcast n'existe pas ou a été retiré ») + lien retour `/podcasts`. Erreur réseau générique → `error.tsx` du segment avec bouton « Réessayer » (`reset()`).
- **Génération en cours / échec** (`podcast.status !== 'completed'` ou `audioUrl` vide) : panneau de lecture remplacé par un état informatif (« Audio en cours de génération… » avec `status` / « Échec de génération » si `errorMessage`). Pas de bouton play actif. [À VALIDER : valeurs exactes de `status`.]
- **Offline** : si la page n'est pas en cache SW → fallback app-shell (cf. AUDIT §6, cache app-shell v1). Si l'audio est déjà bufferisé et joue, la lecture continue (player singleton non démonté). Bandeau discret « Hors ligne » si fetch détail échoue offline.
- **Erreur de lecture audio** : gérée par le player existant (`audio.play().catch`) → Toast + retry (déjà prévu DESIGN_SYSTEM §8). Pas à redéfinir ici.

## 6. Responsive

- **Bascule au breakpoint `lg` (1024px)** conforme au shell.
- **Mobile (< lg)** :
  - Layout vertical pleine largeur, gouttière 20px.
  - Pochette grande et centrée (≈ largeur écran − gouttières, ratio 1:1, plafonnée ~280px).
  - Contrôles empilés : titre/source, scrubber pleine largeur, rangée [-15s · Play 56px · +30s], vitesse en dessous.
  - Nav prev/next en deux cartes empilées sous les contrôles.
  - Le **mini-player flottant** du shell est masqué/redondant sur cette page si la piste affichée == piste courante (éviter le doublon visuel). [À VALIDER : masquer ou garder le mini-player sur sa propre page de détail.]
- **Desktop (≥ lg)** :
  - Colonne centrée `max-w-[640px]` (contrainte de lecture DS §4).
  - Pochette à gauche (~200px), bloc titre/source/durée/scrubber à droite (layout en 2 colonnes pour le header), contrôles sous le header.
  - Nav prev/next en rangée 2 colonnes.
  - Le player ancré en bas de la zone contenu reste visible (Spotify-like) ; cohérent avec le scrubber inline.

## 7. Composants

**DS existants réutilisés :**
- `usePlayerStore`, `formatTime`, type `Track` (`player/player-store.ts`).
- `AudioPlayer` (singleton, **non re-monté** ici — seulement piloté).
- `Button`, `IconButton` (`ui/button.tsx`) — actions lecture, -15/+30, retour.
- `Slider` (`ui/slider.tsx`) — scrubber audio (déjà câblé style DS).
- `Tag` (`ui/tag.tsx`) — badge `AUDIO · <SOURCE>` / type contenu.
- `ContentCard` (`content/content-card.tsx`) — carte « contenu source » lié (réutiliser tel quel avec `ContentCardData`).
- Tokens/typo DS : `font-display`, `bg-surface`, `shadow-elev-1/2`, dégradé fallback pochette identique à `PlayerCover`.

**NOUVEAUX composants à créer :**
1. `PodcastPlayPanel` (`components/podcast/podcast-play-panel.tsx`, `"use client"`) — bloc de lecture inline : pochette, titre/source, scrubber `Slider` lié au store, boutons play / -15s / +30s, sélecteur de vitesse. Gère le cas « piste courante == ce podcast » vs « lancer ce podcast ».
2. `PodcastNav` (`components/podcast/podcast-nav.tsx`, server) — deux liens prev/next avec titre contextuel, état désactivé si `null`, préfetch.
3. `PlaybackSpeedSelect` (`components/podcast/playback-speed-select.tsx`, `"use client"`) — `Select` Base UI 0.75×–2× pilotant `playbackRate` du store. [Dépend de l'ajout `playbackRate` au store — voir §10.]
4. `PodcastTranscript` (`components/podcast/podcast-transcript.tsx`) — `Collapsible` Base UI affichant `dialogueText`. [Optionnel selon validation §4.]

## 8. Interactions

- **Clic Play** : si la piste courante du store ≠ ce podcast → `play(track)` (remplace la piste, démarre). Si == ce podcast → `toggle()` (play/pause).
- **Scrubber** : `onValueChange` → `requestSeek(time)` (consommé par l'`AudioPlayer`). Affichage live `currentTime`/`duration` depuis le store. Actif seulement si piste courante.
- **-15s / +30s** : `requestSeek(Math.max(0, currentTime - 15))` / `requestSeek(currentTime + 30)` — même logique que `audio-player.tsx`.
- **Vitesse** : sélection → `setPlaybackRate(rate)` (nouveau) → appliqué sur `<audio>.playbackRate` dans `AudioPlayer`.
- **Prev/Next** : navigation `Link` vers `/podcasts/[nextId|prevId]` (RSC re-render). NE change PAS la lecture en cours automatiquement — l'utilisateur relance via Play (sauf décision §10 « enchaînement auto »).
- **MediaSession previoustrack/nexttrack** : [À VALIDER] câbler ces handlers pour qu'ils naviguent ET lancent prev/next, offrant les boutons piste suivante/précédente du lockscreen. Nécessite que le store connaisse les voisins (passer next/prev id au store au moment du `play`).
- **Clic « contenu source »** : `Link` → `/content/[key]/[id]`.
- **Transcription** : toggle `Collapsible`.
- **Gestes mobile** : scrub tactile géré par `Slider` Base UI (`pointer: coarse`). Pas de swipe custom prev/next en v1.

## 9. Accessibilité

- Toutes les icônes-actions ont un `aria-label` explicite (`Lecture`/`Pause`, `Reculer de 15 secondes`, `Avancer de 30 secondes`, `Podcast précédent : <titre>`, `Podcast suivant : <titre>`).
- `aria-live="polite"` sur le titre de la piste courante (DESIGN_SYSTEM §12 — player annoncé).
- Scrubber : `Slider` Base UI fournit `role="slider"`, valeurs ; ajouter `aria-label="Position de lecture"` et `aria-valuetext` formaté (`formatTime`).
- Cibles ≥ 44px (bouton play 56px mobile / 48px desktop, IconButtons 42px DS).
- Focus clavier visible (anneau orange DS) sur play, scrubber, vitesse, prev/next, transcription.
- Transcription `Collapsible` : `aria-expanded` géré par Base UI ; bouton déclencheur libellé « Afficher/Masquer la transcription ».
- `prefers-reduced-motion` : pas d'animation de pochette/équaliseur décoratif.
- Contraste : durée/méta en `--text-dim` (AA vérifié) ; orange réservé aux actions.

## 10. Décisions ouvertes

1. **Vitesse de lecture** : ajouter `playbackRate` + `setPlaybackRate` au `player-store` et l'appliquer dans `AudioPlayer` (`audio.playbackRate`) ? (recommandé — feature attendue sur du podcast long-format).
2. **MediaSession prev/next** : le store doit-il porter les voisins (`nextId`/`prevId`) pour câbler `previoustrack`/`nexttrack` au lockscreen et/ou **enchaîner automatiquement** sur `ended` ? Sinon prev/next restent purement navigation in-page.
3. **Enchaînement auto** : à la fin d'un podcast (`onEnded`), lancer automatiquement `next` ? (style file d'écoute) ou s'arrêter ? Impacte le store et le mapping voisins.
4. **Mini-player sur sa propre page** : masquer la barre flottante du shell quand on est sur `/podcasts/[id]` et que la piste affichée est la piste courante (éviter le doublon) ? ou la garder ?
5. **Transcription** : exposer `dialogueText` (qualité, longueur, droits) ? format brut ou structuré (locuteurs) ?
6. **État `status`** : valeurs réelles renvoyées par l'API (`completed` / `pending` / `processing` / `failed` ?) pour câbler proprement l'état « génération en cours » et la stratégie de cache (`detail` vs `live`).
7. **Artwork MediaSession** : `content.image.url` est-il en 512×512 / format compatible MediaMetadata, ou faut-il un fallback/proxy d'image ?

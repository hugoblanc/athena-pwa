# Index des specs d'écran — Athena PWA

> Vue d'ensemble des 13 specs d'écran (`docs/specs/*.md`). Sert de point d'entrée pour les agents dev : table des écrans, **composants partagés à mutualiser** (anti-réinvention), décisions ouvertes consolidées, et ordre de dev recommandé.

---

## 1. Table des écrans

| Écran | Route(s) | Fichier | Décisions ouvertes |
|---|---|---|---|
| Fil d'actu | `/` | [feed.md](./feed.md) | 6 |
| Médias (liste) | `/medias` | [medias.md](./medias.md) | 5 |
| Détail média | `/medias/[key]` | [media-detail.md](./media-detail.md) | 6 |
| Podcasts (liste) | `/podcasts` | [podcasts.md](./podcasts.md) | 8 |
| Lecteur podcast | `/podcasts/[id]` | [podcast-player.md](./podcast-player.md) | 7 |
| Détail contenu | `/content/[key]/[id]` | [content-detail.md](./content-detail.md) | 7 |
| Q&A (chat IA streamé) | `/qa`, `/qa/[jobId]` | [qa.md](./qa.md) | 8 |
| Propositions de loi (liste) | `/propositions` | [propositions.md](./propositions.md) | 6 |
| Détail proposition de loi | `/propositions/[numero]` | [proposition-detail.md](./proposition-detail.md) | 7 |
| Auth (login / register / profil) | `/login`, `/register`, `/profile` | [auth.md](./auth.md) | 7 |
| Préférences de notifications | `/profile/notifications` | [notif-preferences.md](./notif-preferences.md) | 7 |
| Roadmap (En construction) | `/roadmap` | [roadmap.md](./roadmap.md) | 6 |
| Share + pages statiques | `/share/[key]/[contentId]`, `/informations`, `/privacy`, overlay tuto | [share-static.md](./share-static.md) | 9 |

**Total : 13 écrans, 89 décisions ouvertes brutes** (consolidées en §3 ci-dessous).

---

## 2. Composants partagés à créer (déduplication)

Plusieurs specs proposent indépendamment le même composant sous des noms voisins. **Cette section les fusionne** : un seul composant générique à construire, réutilisé par tous les écrans concernés. Les agents dev **doivent réutiliser ces briques** plutôt que d'en recréer une variante locale.

### 2.1 Briques fondatrices (à faire en premier — tout en dépend)

| Composant | Emplacement cible | Demandé par | Note |
|---|---|---|---|
| **`AuthProvider` + `useAuth()`** | `components/providers/auth-provider.tsx` | auth, notif-preferences | Context Firebase `onAuthStateChanged` → `{ user, loading }`. Prérequis de tout écran protégé. |
| **`InfiniteSentinel`** + hook `useIntersection` | `components/ui/infinite-sentinel.tsx` | feed, media-detail, podcasts, propositions | `IntersectionObserver` générique. Plusieurs specs le redemandent ; **créer UNE fois**, prop `disabled` quand `!hasNext`/loading. Fallback bouton « Charger plus » accessible. |
| **`EmptyState`** | `components/ui/empty-state.tsx` | feed, medias, propositions (+ implicitement podcasts, media-detail) | État vide générique : icône + titre + sous-texte + action. |
| **`ContentCardSkeleton`** + pattern skeleton générique | `components/content/content-card-skeleton.tsx` | feed (`FeedSkeleton`), medias, media-detail, podcasts (`PodcastCardSkeleton`), content-detail (`ContentDetailSkeleton`), propositions (`LawProposalCardSkeleton`), notif-preferences, roadmap | **6+ specs proposent un skeleton de carte.** Créer un `Skeleton` primitif (`bg-surface-2 animate-pulse`) + un `ContentCardSkeleton` iso-dimension réutilisable ; les variantes par écran ne sont que des compositions. |

### 2.2 Cartes et listes (`components/content/`)

| Composant | Emplacement cible | Demandé par | Note |
|---|---|---|---|
| **`ContentCard` / `HeroCard`** | `components/content/content-card.tsx` *(EXISTE déjà — réutiliser)* | feed, media-detail, content-detail, podcast-player, qa (réf. style), share | Carte de contenu + carte source. Ne pas redéfinir : mapper les types vers `ContentCardData`. |
| **`MediaCard`** | `components/content/media-card.tsx` | medias | Carte média (logo + titre + type), distincte de `ContentCard`. |
| **`MediaSectionHeader`** | `components/content/media-section-header.tsx` | medias, notif-preferences (`NotificationSectionHeader`) | **En-tête de groupe `kicker` sticky** demandé deux fois (annuaire médias + sections de notif). Mutualiser un `SectionHeader` générique avec slot d'action à droite (le switch « tout activer » réutilise le slot). |
| **`PodcastCard`** | `components/content/podcast-card.tsx` | podcasts | Carte podcast (logo + titre + durée + bouton play lié au `player-store`). |
| **`LawProposalCard`** | `components/law/law-proposal-card.tsx` | propositions | Carte proposition (avatar coloré + badges + key point). |
| **`IssueCard`** | `components/roadmap/issue-card.tsx` | roadmap | Carte issue + bloc clap. |

### 2.3 Primitives UI réutilisables (`components/ui/`)

| Composant | Emplacement cible | Demandé par | Note |
|---|---|---|---|
| **`SearchField`** | `components/ui/search-field.tsx` | feed, medias (`MediaSearchBar`), podcasts (`PodcastSearchBar`) | **3 specs proposent un champ de recherche debouncé.** Créer UNE primitive (input ≥16 px anti-zoom iOS, icône, clear, debounce configurable, compteur de résultats optionnel). |
| **`Tabs`** | `components/ui/tabs.tsx` | proposition-detail (réutilisable ailleurs) | Wrapper Base UI `Tabs` stylé DS. |
| **`Avatar`** | `components/ui/avatar.tsx` | proposition-detail, propositions, auth (`ProfileCard`), medias (fallback logo) | Image + fallback initiales sur dégradé + prop `ringColor` (liseré groupe politique). Réutilisable auteurs / médias / profil. |
| **`TextField`** | `components/ui/text-field.tsx` | auth, roadmap (`NewIssueDialog`), notif | Champ input stylé DS (label, erreur, ≥16 px / ≥44 px). |
| **`PasswordField`** | `components/ui/password-field.tsx` | auth | `TextField` + `IconButton` œil. |
| **`Switch`** | `components/ui/switch.tsx` *(EXISTE — réutiliser)* | notif-preferences, auth | Master + par média + par section. |

### 2.4 Partage, PWA, transverses

| Composant | Emplacement cible | Demandé par | Note |
|---|---|---|---|
| **`ShareButton` (global)** | `components/ui/share-button.tsx` | content-detail, proposition-detail, qa (repartage) | **3 specs proposent leur propre `ShareButton`.** **Créer UN composant global** : Web Share API + fallback copie-lien + Toast. Ne PAS dupliquer par domaine (cf. décision ouverte proposition-detail #6 + content-detail #7). |
| **`A2HSPrompt`** + hook PWA | `components/pwa/a2hs-prompt.tsx` | notif-preferences, auth, share-static (`ShareContinueCard`) | **Prompt d'installation PWA transverse** (instructions iOS Safari + `beforeinstallprompt` Android). Clé du push iOS. Réutilisé par notif, auth (A2HS post-connexion), share. **Créer UNE fois.** |
| **`useFirstLaunch`** | `components/onboarding/use-first-launch.ts` | share-static | Flag `FIRST_LAUNCH` (localStorage + fallback) ; `replay` pour « Revoir le tuto » depuis Informations. |
| **`StaticPageLayout`** + styles « prose » maison | `components/static/static-page-layout.tsx` | share-static (Informations, Privacy), content-detail (`ContentBody` prose) | **Styles éditoriaux (prose) demandés deux fois** (corps d'article HTML + pages statiques). Mutualiser un wrapper/classe `prose` maison (titres, listes, blockquotes, liens orange, images responsives). |

### 2.5 Modules non-composants partagés (`lib/`)

| Module | Emplacement cible | Demandé par | Note |
|---|---|---|---|
| **Couleurs des groupes politiques** | `lib/law/political-groups.ts` (= `group-colors.ts`) | propositions (`politicalGroupColor`), proposition-detail (`groupColors`) | **Deux specs définissent la MÊME map** `PoliticalGroupCode → { color, label }`. **Un seul module** (12 groupes + UNKNOWN/NI). |
| **`formatDuration` / `formatTime`** | `player/player-store.ts` ou `lib/format.ts` | podcasts, podcast-player | `formatTime` existe ; ajouter `formatDuration` humanisé (« 1 h 12 »). |
| **Sanitization HTML serveur** | `lib/sanitize.ts` | content-detail | Allowlist (`isomorphic-dompurify`/`sanitize-html`) avant `dangerouslySetInnerHTML`. |
| **`lib/api/push.ts`** | `lib/api/push.ts` | notif-preferences | `subscribePush` / `unsubscribePush` / `getVapidPublicKey` (⚠ dépend du backend, cf. décisions). |
| **`mapAuthError(code)`** | `lib/auth-errors.ts` | auth | Codes Firebase → messages FR. |
| **Helper Web Push** | `lib/push/web-push-client.ts` | notif-preferences | Permission, subscribe, conversion clé VAPID, détection iOS/standalone. |

### 2.6 Réutilisation du singleton player

`usePlayerStore` / `Track` / `AudioPlayer` (`player/player-store.ts`, monté au shell) sont **déjà en place**. Réutilisés par : podcasts, podcast-player, content-detail (TTS), feed (offset bottom). **Ne jamais re-monter `<audio>`.** Chantier store identifié : ajouter `playbackRate` + `setPlaybackRate` (podcast-player) et éventuellement les voisins `nextId`/`prevId` (MediaSession).

---

## 3. Décisions ouvertes consolidées

Regroupées par thème transverse pour trancher en un coup d'œil. Les `[BLOQUANT]` conditionnent le démarrage du dev de l'écran.

### A. Trous / chantiers backend (prérequis hors front)
1. **[BLOQUANT — roadmap]** Pas de `GET` propre pour lister les issues. Options : (a) exposer `GET /issues` côté `athena_api` proxy GitHub *(recommandé)*, (b) route handler Next vers l'API GitHub *(claps désynchronisés)*, (c) reporter la liste (v1 = bouton « Proposer » + lien GitHub). Sans réponse → option (c).
2. **[BLOQUANT — notif-preferences]** Endpoints push absents du contrat : `POST /push/subscribe`, `POST /push/unsubscribe`, `GET /push/vapid-public-key` + table `PushSubscription`. Qui implémente ?
3. **[notif-preferences]** Shape conventionnelle des préférences (`NotificationPreferences`, clé `preferences.notifications`) pour le `PUT` partiel.
4. **[proposition-detail]** `sections`/`amendements` présents dans l'AUDIT mais absents du type `LawProposal` committé : l'API les renvoie-t-elle (étendre le type) ou l'« Officiel » se limite à `description` + `exposeMotifs` + PDF ?
5. **[content-detail]** Résolution `key`/`contentId` → `id` : `/content/:id` accepte-t-il le `contentId` brut, ou faut-il `get-id-from-content-id-and-media-key` (1 appel de plus) ?
6. **[content-detail]** HTML déjà sanitizé côté API ? Sinon valider la lib (`isomorphic-dompurify` vs `sanitize-html`).
7. **[content-detail]** Où trouver le `videoID` YouTube (absent du type `Content`) ? Iframe vs lien `originalUrl`.
8. **[podcasts / podcast-player]** Valeurs réelles de `status` podcast (`completed`/`pending`/`processing`/`failed`) et paramètre de tri `/podcast/list` ?
9. **[media-detail]** En-tête média dérivé de `getMetaMedias()` (find par key) ou nouvel endpoint `GET /meta-media/:key` ?

### B. Pagination & navigation (à uniformiser)
10. **[feed, media-detail, podcasts, propositions]** Pattern de pagination unique : infinite scroll (`InfiniteSentinel`) + fallback bouton « Charger plus » — **à valider comme standard transverse** plutôt que par écran.
11. **[feed, podcasts, propositions]** État des filtres/recherche dans l'URL (`?q=`, `?medias=`, `?groupe=`) vs état local. **Recommandation transverse : URL** (partage, SSR, back).
12. **[feed]** `size` de page : 10 (aligné API) ou 20 ?
13. **[qa]** Sous-route `/qa/[jobId]` (deep-link réponse) en v1 ou v2 ?

### C. Filtres médias / types (récurrent)
14. **[feed, medias]** Filtre par type sans support API : mapping « type → `mediaKeys` » (Vidéos = YOUTUBE, Articles = WORDPRESS). Confirmer + libellés FR.
15. **[feed]** Multi-sélection médias (`MediaFilterSheet`) vs sélection unique `FilterChips` en v1.
16. **[medias]** Recherche + filtre client dès la v1 malgré le faible volume ?
17. **[media-detail]** Un `key` est-il strictement mono-type (sinon garder un filtre) ?
18. **[propositions]** Filtre groupe multi-sélection (CSV API) vs mono. Filtre date (`dateDebut`/`dateFin`) en v1 ? Tri « Récemment simplifiées » supporté par l'API ?

### D. Player audio
19. **[podcast-player]** Ajouter `playbackRate` au store (vitesse 0.75×–2×) ?
20. **[podcast-player]** MediaSession prev/next + enchaînement auto sur `ended` (store porte les voisins) ?
21. **[podcast-player]** Masquer le mini-player flottant sur la page détail quand la piste affichée == piste courante ?
22. **[feed]** Play TTS directement depuis la carte du feed, ou réservé au détail/podcasts ?
23. **[content-detail]** Bloc « Continuer en podcast » (appel `getPodcastByContent` systématique) en v1 ?

### E. Partage & SEO
24. **[content-detail, proposition-detail, qa]** **Mutualiser un `ShareButton` global** (Web Share + fallback) — confirmé, voir §2.4.
25. **[content-detail, share-static]** URL canonique de partage : `/share/:key/:contentId` (page OG) ou `/content/:key/:id` direct ?
26. **[share-static]** Share dans le shell ou page d'atterrissage autonome ? Auto-redirect → lecture vs CTA manuel (recommandé : manuel) ? Repli OG sur 404 ?
27. **[qa]** Navigation depuis une source : route interne `/content/...` (préférable) vs lien externe `url` ?

### F. Auth & profil
28. **[auth]** Login/register : composant partagé `<AuthForm mode>` (recommandé) vs deux composants ? Mode invité (« Continuer sans compte ») visible ? Pseudo demandé à l'inscription ?
29. **[auth]** Périmètre du hub `/profile` (fusion menu « Plus » + Profil ?) et où monter `AuthProvider` (layout racine recommandé).
30. **[auth, notif, roadmap, share-static]** A2HS : où déclencher le prompt d'installation (post-connexion / notif / tuto) ? **Un seul `A2HSPrompt` transverse** (§2.4).

### G. UX optionnelles (in/out v1)
31. **[feed]** Pull-to-refresh mobile ?
32. **[content-detail]** Barre de progression de lecture + réglage taille de texte + temps de lecture estimé : v1 ou différé ?
33. **[propositions]** Compteur d'en-tête via `getLawStats()` ? Chip « Effacer les filtres » ?
34. **[proposition-detail]** Onglet par défaut Simplifié si `completed` sinon Officiel ? Sommaire d'articles ancré (desktop) ? Layout colonne latérale « fiche » vs pile centrée ?
35. **[podcast-player]** Transcription `dialogueText` dépliable (qualité/longueur/droits) ?
36. **[qa]** Liste exacte des questions suggérées (zero state) ? Throttling `aria-live` pendant le stream ? Contexte mono-tour confirmé ?
37. **[notif-preferences]** Opt-out (tous notifient par défaut, recommandé) vs opt-in ? Granularité catégories en v2 ? Bouton « notification de test » ?
38. **[roadmap]** Clap optimiste anti-double-vote localStorage (contournable) ? Détail in-app vs lien GitHub ? Garde-fou anti-spam sur `POST /issues` public ?
39. **[share-static]** Slide notifications dans le tuto (sans permission forcée) ? Sommaire ancré Privacy ? Contenu statique en dur vs MDX/CMS ? Stockage flag (localStorage vs IndexedDB) ?

### H. Divers transverses
40. **[proposition-detail, +]** Format des dates FR (Intl natif vs date-fns) — **à fixer une fois pour toute l'app**.
41. **[propositions, proposition-detail]** Palette des 12 groupes politiques (neutralité éditoriale) — **un seul module** (§2.5).
42. **[qa]** Route handler SSE proxy vs `EventSource` direct (QA public) — direct recommandé, proxy si mixed-content prod.

---

## 4. Ordre de dev recommandé

Ordonné par dépendances : briques transverses d'abord, écrans publics simples ensuite, écrans riches/protégés en dernier.

### Phase 0 — Briques transverses (débloquent tout le reste)
0. **Primitives UI partagées** (§2) : `Skeleton`/`ContentCardSkeleton`, `EmptyState`, `InfiniteSentinel` + `useIntersection`, `SearchField`, `Avatar`, `Tabs`, `TextField`/`PasswordField`, `ShareButton` global, `SectionHeader`. Module `lib/law/political-groups.ts`, `lib/sanitize.ts`, `formatDuration`, styles `prose` maison.
   - *Aucune dépendance écran ; toutes les phases suivantes en consomment.*

### Phase 1 — Cœur public (lecture, SSR/SEO)
1. **Fil d'actu** (`/`) — écran d'entrée ; valide `ContentCard`/`HeroCard`, `InfiniteSentinel`, `SearchField`, `EmptyState`, skeletons.
2. **Médias (liste)** (`/medias`) — réutilise `MediaCard` + `SectionHeader` ; simple, public.
3. **Détail média** (`/medias/[key]`) — dépend de §1/§2 (cartes, infinite scroll) ; introduit `MediaHeader`.
4. **Détail contenu** (`/content/[key]/[id]`) — cible des liens du feed/média ; dépend de `prose`, `ShareButton`, sanitize, et du **player singleton** (TTS).

### Phase 2 — Audio
5. **Podcasts (liste)** (`/podcasts`) — `PodcastCard` + `player-store` ; dépend de `SearchField`, `formatDuration`.
6. **Lecteur podcast** (`/podcasts/[id]`) — dépend de la liste podcasts et du **chantier store** (`playbackRate`, voisins). `ShareButton`, `Tabs`/`Collapsible`.

### Phase 3 — Lois
7. **Propositions de loi (liste)** (`/propositions`) — dépend de `Avatar`, `political-groups`, `InfiniteSentinel`, filtres URL.
8. **Détail proposition de loi** (`/propositions/[numero]`) — dépend de `Tabs`, `Avatar`, `political-groups`, `ShareButton` ; cible des cartes de §7.

### Phase 4 — IA conversationnelle
9. **Q&A** (`/qa`) — autonome (API QA publique) ; réutilise `ContentCard` (cartes sources), `ShareButton`. Peut démarrer dès la Phase 0 si priorisé (différenciant produit).

### Phase 5 — Compte & personnalisation (protégé — dépend d'`AuthProvider`)
10. **Auth** (`/login`, `/register`, `/profile`) — livre `AuthProvider`/`useAuth()` (**prérequis** de §11), `TextField`/`PasswordField`, `ProfileCard`, `SidebarProfile`, `mapAuthError`.
11. **Préférences de notifications** (`/profile/notifications`) — dépend d'`AuthProvider`, `A2HSPrompt`, `lib/api/push.ts` et du **chantier backend push** (§3.A.2). À planifier après confirmation backend.

### Phase 6 — Périphérie
12. **Share + pages statiques** (`/share/...`, `/informations`, `/privacy`, tuto) — `StaticPageLayout`, `ShareContinueCard`, `OnboardingOverlay`, `useFirstLaunch` ; dépend de `A2HSPrompt` et des `prose` styles. Le tuto référence Informations.
13. **Roadmap** (`/roadmap`) — **dépend de l'arbitrage backend §3.A.1** ; v1 minimale (option c) livrable indépendamment, liste complète après exposition du `GET`.

> **Chemin critique** : Phase 0 → AuthProvider (Phase 5.10) débloque la personnalisation ; les chantiers backend (push, GET issues) sont les seuls vrais bloqueurs et doivent être lancés en parallèle dès le départ.

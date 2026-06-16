# Spec écran — Roadmap (En construction)

## 1. Route & placement nav

- **Route** : `/roadmap` (App Router : `app/roadmap/page.tsx`).
- **Placement nav** : PAS dans la nav principale (`NAV_ENTRIES` reste à 5 entrées : Fil / Médias / Podcasts / Lois / Athena). La Roadmap est une entrée **secondaire**, accessible depuis le futur menu « Plus » (cf. AUDIT §7-6) et/ou un lien dans `/informations`. En attendant le menu « Plus », ajouter un lien d'accès :
  - **Desktop** : entrée dédiée en bas de la `Sidebar`, au-dessus du bloc profil (icône `Hammer` ou `Construction` de lucide-react).
  - **Mobile** : entrée dans le menu réglages de la `TopBar` (l'`IconButton` Settings ouvrira un menu — y placer « Roadmap »).
- **[À VALIDER]** Emplacement exact du point d'entrée tant que le menu « Plus » n'existe pas (cf. §10).

## 2. Objectif (2-3 lignes)

Donner aux utilisateurs une fenêtre sur ce qui est en construction et leur permettre de **peser sur les priorités** : voir les demandes (issues GitHub), voter via un « clap », et soumettre une nouvelle idée. C'est l'écran d'engagement produit — il transforme un usager passif en contributeur, sans quitter la PWA.

## 3. Données (API)

### Trou critique dans le contrat (cf. §10)
L'AUDIT §3 ne liste pour le domaine GitHub/Issues que **deux endpoints écriture** :
- `POST /issues` → crée une issue, renvoie `Observable<Issue>`.
- `POST /issues/:issueId/clap` → incrémente le clap, renvoie `Observable<Issue>`.

**Il n'existe AUCUN `GET` propre** pour lister/lire les issues : le seul `GET /issues` recensé porte un body anormal et est marqué SUPPRIMER (AUDIT §2 ligne 33, §3 ligne 102). On ne peut donc **pas afficher la liste** avec le contrat actuel. → bloquant fonctionnel, traité en décision ouverte §10.

### Module API à créer : `lib/api/roadmap.ts`
Type `Issue` **déjà présent** dans `lib/api/types.ts` (`{ id?, title, body?, claps? }`). À étendre (cf. §10) avec `state`, `htmlUrl`, `createdAt`, `reactions` si on s'aligne sur le schéma GitHub.

Fonctions à créer (références par nom, à coder selon le pattern existant) :

| Fonction | Endpoint | Server/Client | Cache |
|---|---|---|---|
| `createIssue(input: { title; body? }): Promise<Issue>` | `POST /issues` | **client** (action utilisateur) — pattern identique à `askQuestion()` dans `qa.ts` : `fetch` POST + `Content-Type: application/json` | n/a (mutation) |
| `clapIssue(issueId: number): Promise<Issue>` | `POST /issues/:id/clap` | **client** (action utilisateur) | n/a (mutation) |
| `listIssues(): Promise<Issue[]>` ⚠️ **À CRÉER CÔTÉ API D'ABORD** | `GET /issues` propre (à exposer) **ou** route handler Next proxy vers GitHub | **server** (RSC) | `CACHE.list` (ISR 60 s) |

- Réutiliser `apiGet` (`client.ts`) pour le futur `listIssues` ; réutiliser le pattern POST de `qa.ts` (pas de helper `apiPost` existant — soit l'ajouter à `client.ts`, soit inliner comme `askQuestion`). **[À VALIDER]** ajouter un `apiPost<T>` générique à `client.ts` plutôt que dupliquer.
- **Server vs client** : la **liste** se rend en RSC (SSR/ISR, public, gain SEO). La **création** et le **clap** sont des feuilles `"use client"` (interactions). Pas d'auth requise (endpoints publics) → pas besoin de `authFetch`.
- **Pagination** : l'API GitHub Issues pagine (param `page`/`per_page`). Si on proxy GitHub, prévoir `?page=` ; sinon liste plate. Ne PAS réutiliser les 4 enveloppes Athena (incompatibles). **[À VALIDER]** selon la décision §10.

## 4. Améliorations UX proposées

- **Tri par votes décroissants** par défaut (les demandes les plus réclamées en haut) — cohérent avec le workflow de triage CLAUDE.md (« sorted by votes »). Sélecteur de tri secondaire : « Plus votées » / « Plus récentes ». [À VALIDER] dépend d'avoir un GET qui renvoie `claps`/`reactions`.
- **Clap optimiste** : incrémenter le compteur immédiatement à l'écran, rollback si le POST échoue (toast d'erreur). Rend l'action gratifiante malgré la latence réseau.
- **Anti-double-clap local** : mémoriser en `localStorage` les `issueId` déjà clappés (l'API ne tracke pas l'auteur du clap → pas de garde serveur). Bouter le bouton en état « voté » (rempli orange) pour éviter le spam et donner un feedback de persistance. [À VALIDER] purement cosmétique côté client, contournable.
- **Création via feuille/modale `Dialog`** (pas une page séparée) : champ titre (obligatoire) + description (markdown léger, optionnel) + compteur de caractères. Reste dans le contexte de la liste.
- **Filtre d'état** (chips `Tout / En cours / Fait`) si l'API expose `state`/labels GitHub — sinon masqué. [À VALIDER]
- **Lien sortant vers GitHub** : chaque carte propose « Voir sur GitHub » (`window.open(_blank)`, cf. AUDIT — InAppBrowser remplacé par `_blank`) si `htmlUrl` disponible.
- **Encart pédagogique en tête** : court paragraphe « Athena est open-source. Votez pour orienter les priorités, ou proposez une idée. » avec lien vers le repo. Donne du sens à l'écran « En construction ».

## 5. États

- **Loading** : skeleton de **liste de cartes** (réutiliser le pattern skeleton `bg-surface-2` du DS §10) — 5–6 cartes grises avec barre titre + ligne méta + pastille clap. La création (POST) montre un spinner sur le bouton « Publier » (état `disabled`).
- **Empty** : aucune issue → illustration légère + texte « Aucune demande pour l'instant. Soyez le premier à proposer une amélioration. » + bouton primaire « Proposer une idée ».
- **Error (liste)** : carte d'erreur centrée « Impossible de charger la roadmap » + bouton « Réessayer » (re-fetch / `router.refresh()`).
- **Error (mutation)** : `Toast` (Base UI, DS §6) « Échec de l'envoi, réessayez » ; rollback de l'incrément optimiste pour le clap.
- **Offline** : bannière « Vous êtes hors ligne — la roadmap n'est pas disponible » ; désactiver les boutons clap/création (ils requièrent le réseau). Le SW app-shell (AUDIT §6, cache basique) sert la coquille mais pas la donnée live.

## 6. Responsive

- **Mobile (< lg)** : liste pleine largeur (gouttière 20 px), cartes empilées 1 colonne. Bouton « Proposer une idée » en **FAB** flottant (`rounded-full`, primaire, coin bas-droite, au-dessus de la tab bar — attention à ne pas chevaucher le player flottant : l'aligner ou le décaler). La modale de création s'ouvre en **sheet bas** (`Dialog` slide-up, DS §11).
- **Desktop (≥ lg)** : contenu en colonne centrée `max-w-[640px]` (DS §9). Bouton « Proposer une idée » en bouton primaire **inline** dans l'en-tête de page (à droite du titre), pas de FAB. Modale de création en **fade+scale** centrée. Hover sur les cartes : `translateY(-1px)` + `border-color: --primary` (DS §7.2).

## 7. Composants

### DS existants réutilisés
- `Button` / `IconButton` (`ui/button.tsx`) — variantes `primary` (proposer/publier), `secondary`, `ghost`, `danger`.
- `Tag` (`ui/tag.tsx`) — pour les labels d'état/catégorie GitHub si exposés.
- `FilterChips` (`ui/filter-chips.tsx`) — pour le filtre d'état / tri (si données dispo).
- `TopBar` / `Sidebar` / `AppShell` (`shell/`) — l'écran vit dedans, ne pas re-spécifier.
- `Toast`, `Dialog` (Base UI, DS §6) — feedback mutation + modale de création.
- Skeleton : motif `bg-surface-2` du DS (pas un composant dédié recensé).

### Nouveaux composants à créer
1. **`IssueCard`** (`components/roadmap/issue-card.tsx`) — carte d'une demande : titre (`card-title`, `font-display`, clamp 2 lignes), extrait du body (`body-sm`, `--text-dim`), `Tag` d'état optionnel, et **bloc clap** à droite. Toute la carte ouvre le détail/GitHub ; le bouton clap a son propre hit-zone (stopPropagation).
2. **`ClapButton`** (`components/roadmap/clap-button.tsx`, `"use client"`) — pastille `rounded-full` avec icône (`Hand`/`ThumbsUp` lucide) + compteur ; gère l'incrément optimiste, l'état « déjà voté » (localStorage), le rollback. Accent orange à l'état voté.
3. **`NewIssueDialog`** (`components/roadmap/new-issue-dialog.tsx`, `"use client"`) — `Dialog` Base UI : champ titre (≥16 px anti-zoom iOS), textarea description, compteur, bouton « Publier » avec état loading, validation (titre requis). Appelle `createIssue`, ferme + toast succès + refresh liste.
4. **`RoadmapIntro`** (`components/roadmap/roadmap-intro.tsx`) — encart pédagogique en tête (texte + lien repo open-source).
5. **`RoadmapList`** (`components/roadmap/roadmap-list.tsx`) — wrapper liste : skeleton/empty/error + mapping `IssueCard`. Reçoit les issues du RSC parent.

## 8. Interactions

- **Clap** : tap sur `ClapButton` → incrément optimiste + `clapIssue(id)` ; succès = état voté persisté (localStorage) ; échec = rollback + toast. Désactivé si déjà voté localement ou hors ligne.
- **Ouvrir une demande** : tap sur la carte (hors zone clap) → ouvre l'URL GitHub dans un nouvel onglet (`window.open(htmlUrl, "_blank")`) **si** `htmlUrl` exposé ; sinon la carte n'est pas un lien (pas de détail in-app prévu en v1). [À VALIDER]
- **Proposer une idée** : tap FAB (mobile) / bouton header (desktop) → ouvre `NewIssueDialog`. Soumission → `createIssue` → fermeture + toast + nouvelle issue ajoutée en tête de liste (optimiste) ou `router.refresh()`.
- **Tri / filtre** : sélection d'une chip → re-tri client (si liste plate en mémoire) ou re-fetch avec query (si proxy paginé).
- **Pas de lecture audio** sur cet écran.

## 9. Accessibilité

- `ClapButton` : `aria-label` explicite (« Voter pour : <titre> — N votes »), `aria-pressed` reflétant l'état voté, `aria-live="polite"` sur le compteur pour annoncer l'incrément.
- `NewIssueDialog` : focus trap (fourni par Base UI `Dialog`), `aria-labelledby` sur le titre de la modale, focus initial sur le champ titre, restauration du focus à la fermeture. Champs `<label>` associés.
- FAB : `aria-label="Proposer une idée"`, cible ≥ 44×44 px (DS §4).
- Cartes : un seul lien englobant pour l'a11y (DS §7.2) ; le bouton clap imbriqué doit rester un `<button>` distinct du lien (pas de bouton dans un lien → utiliser un conteneur cliquable JS ou positionner le clap hors du `<a>`).
- Focus clavier visible (anneau orange 2 px) sur tous les interactifs ; `prefers-reduced-motion` respecté sur l'incrément animé du clap.
- Toasts annoncés via `role="status"` / `aria-live`.

## 10. Décisions ouvertes

1. **TROU API — pas de GET pour lister les issues.** L'AUDIT ne recense que `POST /issues` et `POST /issues/:id/clap` ; le seul `GET /issues` existant a un body anormal et est marqué SUPPRIMER. **On ne peut PAS afficher la liste avec le contrat actuel.** Trois options à arbitrer :
   - (a) **Exposer un `GET /issues` propre côté `athena_api`** (recommandé) qui proxifie GitHub et renvoie `{ id, title, body, state, claps/reactions, htmlUrl, createdAt }[]`. Aligne le clap (qui stocke où ?) avec l'affichage.
   - (b) **Route handler Next** (`app/api/roadmap/route.ts`) qui appelle directement l'**API GitHub** (`GET /repos/hugoblanc/Athena/issues`) avec un token serveur — mais alors les **claps Athena ne sont pas dans GitHub** (le clap est un compteur maison) → désynchro entre la liste GitHub et les claps. Comment les réconcilier ?
   - (c) **Reporter la liste** : v1 = uniquement bouton « Proposer une idée » (POST) + lien vers le repo GitHub, sans liste in-app. Plus simple, livrable immédiatement.
   → **Quelle option ?** Sans réponse, l'écran se limite à (c).
2. **Modèle de données du clap** : où sont stockés les claps ? (table Athena ? réactions GitHub ?) Détermine ce que renvoie le futur GET et si l'anti-double-vote peut être serveur plutôt que localStorage.
3. **Type `Issue`** : faut-il l'étendre (`state`, `htmlUrl`, `createdAt`, `reactions`) selon le schéma retenu ? Aujourd'hui `{ id?, title, body?, claps? }` ne suffit pas pour le tri/filtre/lien.
4. **Création anonyme vs authentifiée** : `POST /issues` est public (pas d'auth) → n'importe qui peut créer une issue. Faut-il un garde-fou (rate-limit, captcha, exiger login Firebase) contre le spam ?
5. **Point d'entrée nav** définitif (menu « Plus » mobile + Sidebar desktop) — voir §1.
6. **Détail in-app** d'une issue : nécessaire, ou lien GitHub suffit ?

roadmap : Roadmap (En construction) — 5 composants à créer, 6 décisions ouvertes

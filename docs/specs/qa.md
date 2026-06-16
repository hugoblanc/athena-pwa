# Spec écran — Q&A (chat IA streamé)

## 1. Route & placement nav

- **Route** : `/qa` (App Router, `src/app/qa/page.tsx`).
- **Placement nav** : 5ᵉ entrée de `NAV_ENTRIES` (`nav-config.ts`) — `{ href: "/qa", label: "Demander à Athena", short: "Athena", icon: Sparkles }`. Déjà câblée dans la Sidebar (desktop) et la TabBar (mobile). Rien à ajouter au shell.
- **Sous-route optionnelle** : `/qa/[jobId]` pour rouvrir/partager une réponse de l'historique (deep-link). Le `page.tsx` racine et `[jobId]/page.tsx` partagent le même composant client de conversation, seul l'état initial diffère (conversation vide vs. réponse hydratée). [À VALIDER] — voir §10.
- L'écran vit **dans** l'AppShell existant (children de `app-shell.tsx`). Particularité : c'est le seul écran « plein cadre » sans `max-w-[640px]` éditorial classique — la zone de chat occupe la hauteur disponible avec composer ancré en bas (voir §6).

## 2. Objectif (2-3 lignes)

Permettre à l'utilisateur de poser une question en langage naturel sur l'actualité des médias libres et recevoir une réponse IA **streamée token par token** (effet ChatGPT), sourcée par des contenus Athena cliquables. C'est la plus-value différenciante du web (absente du mobile) : un point d'entrée conversationnel vers le corpus, avec historique consultable.

## 3. Données (API) — lib/api, server vs client, cache, pagination

Toutes les fonctions existent déjà dans `src/lib/api/qa.ts`. Le QA est **public** (aucun header `Authorization`), ce qui débloque `EventSource` natif (cf. AUDIT §6).

| Étape | Fonction `lib/api/qa.ts` | Endpoint | Server/Client | Cache |
|---|---|---|---|---|
| Charger l'historique initial | `getQaHistory({ page, limit })` | `GET /qa/history` | **Server** (RSC, première page) puis **Client** (pages suivantes) | `CACHE.live` (`no-store`) — historique mutable |
| Poser une question | `askQuestion(question)` → `{ jobId, message }` | `POST /qa/ask` | **Client** (action utilisateur) | n/a |
| Streamer la réponse | `qaStreamUrl(jobId)` → URL | `GET /qa/stream/:jobId` (SSE) | **Client only** (`EventSource`) | n/a (flux) |
| Récupérer le résultat final | `getQaResult(jobId)` | `GET /qa/result/:jobId` | **Client** (filet de sécurité) | `CACHE.live` |
| Supprimer un item d'historique | `DELETE /qa/history/:id` | — | **Client** | n/a |

**Découpage server/client** :
- `page.tsx` (RSC) : `await getQaHistory({ page: 1, limit: 20 })` pour hydrater la liste d'historique sans flash client, passe les items en props au composant client `QaConversation`.
- `QaConversation` (`"use client"`, feuille interactive) : gère le composer, le cycle ask→stream→result, le store de messages local, le scroll, et la pagination « charger plus » de l'historique (appels `getQaHistory` côté client via `useTransition`/fetch).

**Cycle de streaming (client)** — à implémenter dans un hook `useQaStream` :
1. `askQuestion(question)` → `{ jobId }`.
2. `const es = new EventSource(qaStreamUrl(jobId))`.
3. `es.onmessage` → `JSON.parse(e.data)` typé `QaStreamEvent` :
   - `{ type: "token", content }` → append au buffer de la réponse en cours.
   - `{ type: "done", sources? }` → fige le message, attache `sources`, `es.close()`.
   - `{ type: "error", error }` → état erreur sur la bulle, `es.close()`.
4. **Filet** : si l'`EventSource` se ferme sans `done` (drop réseau), fallback `getQaResult(jobId)` après 1× backoff pour récupérer la réponse complète + sources (couvre le buffering proxy / timeouts). `sources` est déjà parsé défensivement dans `getQaResult`/`getQaHistory` (AUDIT §6 « sources en string »).

**Pagination historique** : `UnifiedPage<QaHistoryItem>` (`fromPaginationPage`). Champ `hasNext` pilote le bouton « Charger l'historique plus ancien ». `limit: 20`.

**[À VALIDER] Route handler SSE** : l'audit (§6) évoque un proxy `runtime="nodejs"`. Comme le QA est public, on attaque l'API **directement** via `EventSource` (chemin simple, zéro proxy). Ne basculer vers un route handler `app/api/qa/stream/[jobId]/route.ts` que si CORS ou mixed-content (http API / https PWA) bloque en prod. Garder `qaStreamUrl` comme seul point à rediriger le cas échéant.

## 4. Améliorations UX proposées

- **Écran d'accueil « zero state » riche** : quand aucune conversation active, afficher un hero (`Sparkles` orange + accroche « Demande à Athena ») + **3–4 questions suggérées** cliquables (chips) qui pré-remplissent et envoient le composer. Justification : un chat vide est intimidant et ne montre pas la capacité ; les suggestions amorcent l'usage. Les suggestions sont statiques v1 (constantes FR liées à l'actualité médias libres). [À VALIDER] — liste exacte des prompts.
- **Streaming avec curseur de frappe** : caret clignotant en fin de texte pendant le stream + auto-scroll « collé en bas » tant que l'utilisateur n'a pas scrollé manuellement (désactive l'auto-scroll s'il remonte, le réactive s'il revient en bas). Évite le scroll-jacking, comportement attendu d'un chat moderne.
- **Sources en cartes compactes sous la réponse** (pas en accordéon par défaut) : chaque `QaSource` = mini-carte cliquable (logo média via `mediaKey` + titre clampé + date). Ouvre le contenu Athena correspondant. Justification : les sources sont le gage de crédibilité, elles doivent être visibles, pas repliées. Repli (`Collapsible`) seulement si > 4 sources.
- **Composer toujours ancré en bas** (style ChatGPT) avec `textarea` auto-grow (max ~5 lignes), envoi `Entrée`, retour ligne `Maj+Entrée`. Bouton envoi orange rond désactivé tant que le champ est vide / qu'un stream est en cours.
- **Bouton « Stop » pendant le stream** : interrompt en fermant l'`EventSource` (la réponse partielle reste affichée et figée). Évite d'attendre une réponse non pertinente.
- **Historique en panneau latéral (desktop) / sheet (mobile)** : liste des questions passées, clic = recharge la conversation (question + answer + sources figées, sans re-streamer). Swipe/menu pour supprimer (`DELETE /qa/history/:id`) avec `Alert Dialog` de confirmation. Justification : réutiliser le travail passé, parité avec les chats IA grand public.
- **Copier la réponse** (icône, toast de confirmation) et **Repartager** (Web Share API) sur chaque bulle de réponse. [À VALIDER] partage.
- **Nouvelle conversation** : bouton `+` qui vide la zone active (l'échange précédent reste dans l'historique). Le QA actuel est mono-tour (pas de fil multi-tours côté API) : on traite chaque question comme un échange indépendant, présenté visuellement en liste de paires Q/R. [À VALIDER] — confirmer que l'API n'a pas de contexte conversationnel (le contrat `askQuestion(question)` ne prend pas d'historique → mono-tour assumé).

## 5. États

- **Loading (historique initial)** : `QaConversation` rendu côté RSC avec données → pas de skeleton au premier paint. Pendant le chargement de pages d'historique supplémentaires : skeleton de 3 lignes `bg-surface-2 animate-pulse rounded-[--radius]`.
- **Loading (réponse en cours)** : bulle réponse avec **skeleton « pensée »** (3 points animés / shimmer) tant que `askQuestion` n'a pas rendu `jobId` et avant le premier token ; puis texte qui se remplit + caret clignotant. Composer verrouillé, bouton « Stop » visible.
- **Empty (zero state)** : hero + suggestions (cf. §4). Pas de liste vide austère.
- **Empty historique** : section historique masquée s'il n'y a aucun item (pas de « Aucun historique »).
- **Error (ask échoue)** : toast `danger` « Impossible d'envoyer la question » + bouton « Réessayer » sur la bulle question. Le composer se déverrouille, le texte saisi est préservé.
- **Error (stream)** : sur event `{type:"error"}` ou drop sans `done` → tenter `getQaResult` ; si échec, bulle en état erreur avec message FR + « Réessayer ». La réponse partielle reçue n'est pas perdue.
- **Offline** : composer désactivé + bandeau discret « Hors ligne — la recherche IA nécessite une connexion » (détection `navigator.onLine` + events `online/offline`). L'historique déjà chargé reste lisible (lecture seule). Le QA n'est pas mis en cache offline (angle mort assumé, AUDIT §6).

## 6. Responsive — mobile (< lg) vs desktop (≥ lg)

**Layout général** : la zone de chat prend la hauteur disponible sous le shell ; le composer est `sticky bottom` (au-dessus de la TabBar mobile / en bas de la colonne contenu desktop). Le fil Q/R scrolle ; le composer reste fixe.

| Aspect | Mobile (< lg) | Desktop (≥ lg) |
|---|---|---|
| Largeur fil de messages | pleine largeur, gouttière 20px | centré `max-w-[720px]` (un peu plus large que les 640px éditoriaux pour le confort de lecture du chat) |
| Historique | **Sheet** (`Dialog` bas) ouvert via icône horloge dans la top-bar de l'écran | **Panneau latéral droit** persistant (≈ 280px) OU repliable ; liste des questions passées |
| Composer | barre fixe `bottom: calc(72px + safe-area)` (au-dessus TabBar), `rounded-[16px] bg-surface border shadow-[--elev-2]` | barre fixe en bas de la colonne contenu, pleine largeur de la colonne |
| Suggestions (zero state) | chips empilées scrollables | grille 2×2 |
| Cartes sources | empilées 1 colonne | 2 colonnes si ≥ 2 sources |

Attention au chevauchement avec le **player audio** (mobile : barre flottante `bottom: 78px`). Le composer doit s'empiler au-dessus du player si celui-ci est actif → calculer l'offset bottom dynamiquement (lire l'état du `player-store`). [À VALIDER] — coexistence composer + mini-player mobile.

## 7. Composants

**DS existants réutilisés** :
- `ui/button.tsx` → `Button` (variant `primary` pour envoi/suggestions, `ghost` pour actions de bulle) + `IconButton` (stop, copier, historique).
- `ui/filter-chips.tsx` → base visuelle des **chips de suggestions** du zero state (sélection mono / déclenchement direct).
- `ui/tag.tsx` → tag `TYPE · SOURCE` sur les cartes sources.
- `content/content-card.tsx` → référence de style pour les **cartes sources** (logo média + titre clampé + méta), version compacte.
- `player/player-store.ts` → lecture de l'état player pour l'offset bottom du composer (mobile).
- Base UI `Dialog` (sheet historique mobile), `Alert Dialog` (confirmation suppression), `Toast` (copie/erreur), `Collapsible` (sources > 4).
- Tokens DS : `bg-surface`, `text-text`/`text-dim`, `border-border`, `text-primary`, `font-display` (titres), `shadow-[--elev-2]`, `rounded-[--radius]`.

**NOUVEAUX composants à créer** (`src/components/qa/`) :
1. **`QaConversation`** (`"use client"`) — conteneur orchestrateur : reçoit l'historique initial (RSC), tient le store de messages, gère scroll/auto-scroll, branche le hook de stream. Feuille interactive racine de l'écran.
2. **`QaComposer`** — `textarea` auto-grow ancré bas, bouton envoi/stop, gestion clavier (Entrée/Maj+Entrée), états verrouillé/offline.
3. **`QaMessage`** — bulle d'un échange : question (alignée droite/neutre) + réponse streamée (caret clignotant), barre d'actions (copier, partager), gère les états loading/streaming/error/done.
4. **`QaSourceCard`** — mini-carte source cliquable depuis un `QaSource` (logo via `mediaKey`, titre clampé, date), lien vers le contenu Athena.
5. **`QaSourceList`** — groupe les `QaSourceCard` (grille responsive + repli `Collapsible` si > 4).
6. **`QaZeroState`** — hero `Sparkles` + accroche + chips de suggestions cliquables.
7. **`QaHistoryPanel`** — liste d'historique (sheet mobile / panneau desktop), pagination « charger plus », suppression par item, clic = recharge l'échange dans `QaConversation`.
8. **`useQaStream`** (hook, `src/components/qa/use-qa-stream.ts`) — encapsule `askQuestion` → `EventSource(qaStreamUrl)` → parse `QaStreamEvent` → fallback `getQaResult`, expose `{ send, stop, status, answer, sources, error }`.

## 8. Interactions

- **Envoyer** : saisie → `Entrée` (ou clic bouton orange) → `askQuestion` → ouverture `EventSource` → tokens affichés en temps réel. `Maj+Entrée` = retour ligne.
- **Stop** : clic « Stop » pendant le stream → `es.close()`, réponse partielle figée, composer déverrouillé.
- **Suggestion (zero state)** : clic chip → pré-remplit + envoie immédiatement.
- **Source** : clic carte source → navigation vers le contenu Athena correspondant (déduire la route depuis `mediaKey` + `contentId`, ou ouvrir `url`). [À VALIDER] — route interne `/content/...` vs lien externe `url`.
- **Copier réponse** : clic icône → `navigator.clipboard.writeText(answer)` → `Toast`.
- **Partager** : clic icône → Web Share API si dispo, sinon copie du texte (fallback).
- **Historique** : ouvrir panneau/sheet → clic item = recharge l'échange (figé, sans re-stream) ; geste swipe (mobile) ou bouton supprimer → `Alert Dialog` → `DELETE /qa/history/:id` → retire de la liste.
- **Nouvelle conversation** : bouton `+` → vide la zone active (échange précédent conservé dans l'historique).
- **Auto-scroll** : collé en bas pendant le stream sauf si l'utilisateur a scrollé vers le haut.
- **Pas de lecture audio** sur cet écran (le player global reste contrôlable mais le QA ne génère pas d'audio).

## 9. Accessibilité

- **`aria-live="polite"`** sur le conteneur de la réponse en cours de stream pour annoncer le texte aux lecteurs d'écran (annoncer le résultat final plutôt que chaque token — débattre du throttling pour éviter le flood [À VALIDER]).
- Composer : `<label>` masqué visuellement (« Pose ta question à Athena »), `textarea` ≥ 16px (anti-zoom iOS), cible bouton ≥ 44px.
- Toutes les icônes-actions (stop, copier, partager, supprimer, historique) ont un `aria-label` explicite.
- Focus clavier visible (anneau orange 2px) sur composer, chips, cartes sources, items d'historique.
- Cartes sources = liens englobants navigables au clavier (Tab + Entrée).
- `Dialog`/`Alert Dialog`/`Collapsible` Base UI fournissent la gestion focus-trap et clavier.
- `prefers-reduced-motion` : désactiver le shimmer/curseur clignotant animé (rendre le texte sans animation), garder un indicateur statique d'état « en cours ».
- État envoi : annoncer « Athena réfléchit… » puis « Réponse reçue » via `aria-live`.

## 10. Décisions ouvertes

1. **Sous-route `/qa/[jobId]`** pour deep-link/partage d'une réponse : à implémenter v1 ou v2 ?
2. **Contexte conversationnel** : confirmer que l'API est strictement mono-tour (pas d'historique envoyé à `askQuestion`). Si oui, on assume une UI « liste de paires Q/R indépendantes » plutôt qu'un vrai fil multi-tours.
3. **Liste exacte des questions suggérées** (zero state) — fournir 3–4 prompts FR pertinents pour l'actualité des médias libres.
4. **Navigation depuis une source** : ouvrir une route interne `/content/...` (préférable pour rester dans la PWA) ou le lien externe `url` du média ? Dépend du mapping `mediaKey/contentId` → route interne.
5. **Partage de réponse** : Web Share API + fallback copie suffisent, ou page de partage dédiée (OG tags) souhaitée ?
6. **Coexistence composer + mini-player audio (mobile)** : valider l'offset bottom dynamique pour éviter le chevauchement.
7. **Route handler SSE** : rester en `EventSource` direct vers l'API (simple, QA public) ou prévoir d'emblée le proxy `runtime="nodejs"` pour parer un éventuel mixed-content http/https en prod ?
8. **Throttling de l'`aria-live`** pendant le stream : annoncer par phrases / à la fin plutôt que par token.

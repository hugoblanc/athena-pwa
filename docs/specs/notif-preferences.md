# Spec écran — Préférences de notifications

## 1. Route & placement nav
- **Route** : `/profile/notifications` (App Router : `app/profile/notifications/page.tsx`).
- **Placement nav** : **hors navigation principale** (`NAV_ENTRIES` inchangé). Accès depuis l'écran **Profil** (`/profile`) via une ligne « Notifications » (icône `Bell`), et — recommandé — depuis le **menu réglages** de la `TopBar` (`src/components/shell/top-bar.tsx`). Vit DANS le shell existant (`AppShell`), aucune modif du shell.
- **Protection** : page **protégée** (auth Firebase requise, comme `/profile`). Si non connecté → redirection vers `/login?next=/profile/notifications` (wrapper/guard client, AUDIT §5 « auth client-side suffit »).
- **Rendu** : **`"use client"`** sur la page (données utilisateur protégées + abonnement Web Push = APIs navigateur `Notification`/`PushManager`/`serviceWorker`). Pas de Server Component ici : tout dépend du `currentUser` Firebase et de l'état push du device. Feature **nouvelle, ex-mobile** (AUDIT §2 ligne 25 & 13, §7 point 11).

## 2. Objectif (2-3 lignes)
Permettre à l'utilisateur connecté d'activer les notifications push web (Web Push VAPID) et de **choisir, par média, s'il veut être notifié** des nouveaux contenus. Les préférences sont **stockées côté serveur par utilisateur** (`getPreferences`/`updatePreferences`) et constituent la **source de vérité du ciblage push** (remplace le modèle FCM-topics natif). L'écran pilote aussi l'abonnement push du device et le prompt d'installation A2HS (clé du push iOS).

## 3. Données (API) — fonctions lib/api, server vs client, cache, pagination
- **Liste des médias** : `getMetaMedias()` de `src/lib/api/meta-media.ts` → `GET /list-meta-media` → `ListMetaMedia[]` (groupés par catégorie). Sert à construire les lignes de switch. **Appel public** : peut être fait en **Server Component parent** (layout `app/profile/layout.tsx` ou un wrapper RSC) puis passé en props à la page cliente — évite un fetch client. Cache `CACHE.list` déjà appliqué.
- **Préférences utilisateur** (client, protégé) :
  - `getPreferences()` de `src/lib/api/user.ts` → `GET /auth/preferences` (Bearer Firebase) → `Record<string, unknown>`.
  - `updatePreferences(partial)` → `PUT /auth/preferences` (MAJ **partielle**).
  - **Forme libre côté API** → définir une **forme conventionnelle** côté front (voir §10 / décision). Proposition de shape stockée :
    ```ts
    interface NotificationPreferences {
      pushEnabled: boolean;          // intention utilisateur (≠ permission device)
      // désabonnements explicites par média (opt-out) : absence = notifié
      mutedMediaKeys: string[];      // ex: ["blast", "le-media"]
      // optionnel v2 : catégories désabonnées par média
      mutedCategories?: Record<string, string[]>; // mediaKey -> [categoryId]
      updatedAt?: string;
    }
    ```
    Stockée sous une clé namespacée, ex. `preferences.notifications`, pour ne pas écraser d'autres préférences (le `PUT` étant partiel).
- **Abonnement Web Push (transverse, à créer)** — n'existe pas encore dans `lib/api`. **NOUVELLES fonctions à ajouter** (AUDIT §5 push Option B VAPID, table `PushSubscription` serveur) :
  - `subscribePush(subscription: PushSubscriptionJSON): Promise<void>` → `POST /push/subscribe` (Bearer) — enregistre l'endpoint/keys du device.
  - `unsubscribePush(endpoint: string): Promise<void>` → `POST /push/unsubscribe` (Bearer).
  - `getVapidPublicKey(): Promise<{ key: string }>` → `GET /push/vapid-public-key` (ou clé via env `NEXT_PUBLIC_VAPID_PUBLIC_KEY`). **[À VALIDER]** ces endpoints ne sont pas dans le contrat actuel (AUDIT §3) → **chantier backend** requis.
  - Helper navigateur `lib/push/web-push-client.ts` : `Notification.permission`, `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`.
- **server vs client** : médias = serveur (RSC parent) ; préférences + abonnement push + état permission = **client** (toutes les mutations).
- **cache** : `list` (médias) = ISR `CACHE.list`. Préférences = **`no-store`** (donnée utilisateur, jamais cachée ; déjà le cas via `authFetch`). Pas de `live`.
- **pagination** : **aucune** — `/list-meta-media` renvoie tout d'un bloc ; les préférences sont un seul objet. `lib/api/pagination.ts` non utilisé.

## 4. Améliorations UX proposées
- **Carte « Activation push » en tête de page** (master switch) : un grand bloc en haut qui orchestre les 3 états réels (permission device · abonnement serveur · intention utilisateur) en **un seul switch lisible** + texte d'état contextuel. Justification : sur mobile la feature ne gérait que les topics ; en web la permission navigateur est un prérequis distinct qu'il faut rendre explicite, sinon l'utilisateur active des médias sans jamais recevoir de push. **Quand le push est désactivé/refusé, les switches par média sont visibles mais grisés** (on montre la valeur produit avant de demander la permission).
- **Modèle opt-out plutôt qu'opt-in** [À VALIDER] : par défaut **tous les médias notifient** (cohérent avec le mobile où l'utilisateur était abonné par défaut au topic du média) ; le switch sert à **couper** un média (`mutedMediaKeys`). Alternative opt-in (tout coupé par défaut) si l'on veut limiter le volume initial.
- **Switch global « Tout activer / Tout couper »** par section/catégorie (en-tête de groupe) : gain de temps quand on suit/ignore une famille de médias entière.
- **Prompt A2HS contextuel (clé iOS)** : si l'utilisateur tente d'activer le push sur **iOS Safari non installé** → afficher une fiche d'explication « Installez Athena sur votre écran d'accueil pour recevoir les notifications » avec instructions (Partager → Sur l'écran d'accueil). Web Push iOS exige la PWA installée (AUDIT §6). Réutilise un composant `A2HSPrompt` transverse. **[À VALIDER]** wording.
- **Sauvegarde optimiste + debounce** : flip immédiat du switch (UI réactive), `updatePreferences` envoyé en **debounce ~500 ms** groupant les changements rapides ; toast d'erreur + rollback si le `PUT` échoue. Évite un appel réseau par clic.
- **Bandeau « notifications bloquées par le navigateur »** si `Notification.permission === "denied"` : explique qu'il faut réautoriser dans les réglages du site (le bouton ne peut plus redemander). [À VALIDER]
- **Test/diagnostic** (optionnel, v2) : bouton « Envoyer une notification de test » pour vérifier que le device reçoit bien. [À VALIDER]
- **Logo + type média par ligne** (réutilise le rendu logo des médias) pour reconnaissance visuelle rapide, au lieu d'une simple liste texte.

## 5. États
- **loading** : `app/profile/notifications/loading.tsx` → **skeleton** : carte d'activation fantôme en tête + 2 en-têtes de section + 6-8 lignes média fantômes (`bg-surface-2` animées, avatar carré + barre titre + switch fantôme). Les préférences se chargent en client : afficher le skeleton des lignes tant que `getPreferences()` n'a pas résolu (les médias peuvent déjà être rendus depuis le RSC parent).
- **empty** : si `getMetaMedias()` renvoie `[]` → état vide centré (icône `BellOff`, « Aucun média disponible pour le moment »). Peu probable.
- **error** :
  - Échec `getMetaMedias()` → `error.tsx` boundary : « Impossible de charger les médias » + **Réessayer** (`reset()`).
  - Échec `getPreferences()` → bandeau inline non bloquant « Impossible de charger vos préférences » + bouton **Réessayer** (les switches restent désactivés tant que non chargées).
  - Échec `updatePreferences()` / `subscribePush()` → **Toast** (`danger`) + rollback du switch concerné.
  - Échec `pushManager.subscribe` (clé VAPID, SW) → message d'aide sous la carte d'activation.
- **offline** : page protégée dans l'app shell ; hors-ligne → bandeau « Vous êtes hors ligne — vos changements seront enregistrés à la reconnexion » **ou** désactiver les mutations (choix : désactiver en v1, AUDIT §6 « ne pas surinvestir offline »). Afficher les dernières préférences en cache si dispo.
- **non connecté** : redirection `/login?next=…` (cf. §1), pas de rendu de l'écran.

## 6. Responsive — mobile (< lg) / desktop (≥ lg)
- **Mobile (`< lg`)** : liste **pleine largeur en une colonne**, gouttière écran 20 px. Carte d'activation push en haut, puis sections (en-tête `kicker` sticky) avec lignes média empilées : `[logo 40px] [titre + type] … [Switch]`, hauteur de ligne ≥ 56 px (cible tactile, switch 46×27). Titre de page `display` (22 px). Le contenu reste **au-dessus de la TabBar** (safe-area).
- **Desktop (`≥ lg`)** : contenu dans la colonne centrée du shell (`max-w-[640px]`). Titre `display-lg` (28 px). Mêmes lignes, hover discret `bg-surface-2` sur la ligne. En-têtes de section peuvent porter le switch « tout activer/couper » du groupe aligné à droite. Tooltips d'aide (Base UI `Tooltip`) sur les états push (masqués en tactile).
- Shell (Sidebar/TabBar) inchangé — DESIGN_SYSTEM §9.

## 7. Composants — DS existants réutilisés + NOUVEAUX
**DS existants réutilisés**
- `Switch` (`src/components/ui/switch.tsx`) — interrupteur master + par média + par section.
- `Button` / `IconButton` (`src/components/ui/button.tsx`) — « Activer les notifications », « Réessayer », « Tout couper », bouton test.
- `Tag` (`src/components/ui/tag.tsx`) — badge type média (`VIDÉOS` / `ARTICLES`) sur la ligne.
- Tokens/patterns DS : `bg-surface` / `surface-2`, `border-border`, `shadow-elev-1`, radius, typo (`display-lg`, `kicker`, `card-title`, `meta`), couleurs `--primary`, `--danger`, `--success`.
- Base UI `Toast` (DS §6) pour erreurs de sauvegarde ; Base UI `Tooltip` (desktop) ; Base UI `Dialog` (sheet bas mobile) pour le prompt A2HS / explications iOS.
- `AppShell` (en place) — l'écran vit dedans.

**NOUVEAUX composants à créer**
1. `PushActivationCard` (`src/components/notifications/push-activation-card.tsx`, `"use client"`) — carte d'orchestration en tête : combine `Notification.permission` + état d'abonnement serveur + intention `pushEnabled` ; master `Switch` + texte d'état + déclenche `subscribePush`/`unsubscribePush` et le prompt A2HS iOS.
2. `MediaNotificationRow` (`src/components/notifications/media-notification-row.tsx`, `"use client"`) — une ligne média : logo (fallback initiale), titre, `Tag` type, `Switch` (état dérivé de `mutedMediaKeys`), grisé si push global off.
3. `NotificationSectionHeader` (`src/components/notifications/notification-section-header.tsx`) — en-tête de catégorie (`kicker` sticky) + switch « tout activer/couper » du groupe (optionnel).
4. `NotificationPreferencesList` (`src/components/notifications/notification-preferences-list.tsx`, `"use client"`) — conteneur : reçoit `ListMetaMedia[]` (props RSC), charge `getPreferences()`, gère l'état local + sauvegarde optimiste/debounce, rend la carte + sections + lignes.
5. `A2HSPrompt` (`src/components/pwa/a2hs-prompt.tsx`, `"use client"`, **transverse**) — fiche/sheet d'invitation à installer la PWA (instructions iOS Safari + `beforeinstallprompt` Android). Réutilisable hors de cet écran.
6. Helper `lib/push/web-push-client.ts` (non-composant) — `ensureSubscription()`, `unsubscribe()`, conversion clé VAPID base64→Uint8Array, détection iOS/standalone.
7. Ajout dans `lib/api/push.ts` (non-composant) — `subscribePush` / `unsubscribePush` / `getVapidPublicKey` (cf. §3, dépend du backend).

## 8. Interactions
- **Toggle master push** (ON) : demande `Notification.requestPermission()` → si `granted`, `pushManager.subscribe({ applicationServerKey })` → `subscribePush(sub.toJSON())` → `pushEnabled=true` via `updatePreferences`. Si `denied` → bandeau d'aide. Sur iOS non-installé → ouvre `A2HSPrompt` au lieu de demander la permission.
- **Toggle master push** (OFF) : `pushManager.getSubscription().unsubscribe()` + `unsubscribePush(endpoint)` + `pushEnabled=false`. Les switches média deviennent grisés (préférences conservées).
- **Toggle d'un média** : ajoute/retire `media.key` de `mutedMediaKeys` → `updatePreferences` (debounce). Sauvegarde optimiste.
- **Switch « tout activer/couper » de section** : applique l'opération à tous les médias du groupe en un `updatePreferences`.
- **Clic « Réessayer »** : relance le fetch en échec.
- **Toast** sur erreur de sauvegarde + rollback du switch.
- **Pas de lecture audio** sur cet écran (player global non sollicité).
- Navigation clavier : switches focusables, ordre logique (master → sections → lignes).

## 9. Accessibilité
- Chaque `Switch` a un **`<label>` associé** explicite : « Notifications de {média.title} » ; le master : « Activer les notifications push ».
- État annoncé : `aria-live="polite"` sur le texte d'état de `PushActivationCard` (« Notifications activées » / « Bloquées par le navigateur »).
- Switches grisés quand push off : `aria-disabled` + `disabled` réel (pas seulement visuel), avec aide « Activez d'abord les notifications ».
- En-têtes de section = vraies balises `<h2>` ; switch de groupe libellé « Tout activer pour {catégorie} ».
- Logos : `alt=""` décoratif (titre déjà dans le label du switch) ; fallback initiale `aria-hidden`.
- Cibles ≥ 44 px (lignes), focus clavier anneau orange 2 px (DESIGN_SYSTEM §12), contraste AA (orange texte → `brand-700` en clair).
- Toast d'erreur `role="status"`/`alert` selon sévérité ; ne vole pas le focus.
- `prefers-reduced-motion` : pas d'animation décorative ; transitions de switch courtes conservées.

## 10. Décisions ouvertes
1. **Endpoints push backend manquants** : `POST /push/subscribe`, `POST /push/unsubscribe`, `GET /push/vapid-public-key` + table `PushSubscription` n'existent pas encore (AUDIT §3/§5). Confirmer le contrat et qui implémente (chantier backend prérequis).
2. **Modèle opt-out vs opt-in** : par défaut tous les médias notifient (opt-out, cohérent mobile) ou tout coupé au départ (opt-in, volume maîtrisé) ?
3. **Shape des préférences** : valider la forme `NotificationPreferences` et la clé de stockage (`preferences.notifications`) pour le `PUT` partiel, afin de ne pas écraser d'autres préférences.
4. **Granularité catégories par média** : on garde **par média seulement** en v1 (les catégories WordPress ne sont pas une entité serveur, AUDIT §5) et on reporte le sous-niveau catégories (`mutedCategories`) en v2 ?
5. **Comportement hors-ligne** : désactiver les mutations (simple) ou file d'attente + sync à la reconnexion ?
6. **Bouton « notification de test »** : utile en v1 pour rassurer l'utilisateur, ou v2 ?
7. **Point d'entrée nav** : ligne dans `/profile` seule, ou aussi dans le menu réglages de la `TopBar` ? (et faut-il un badge si push jamais activé ?)

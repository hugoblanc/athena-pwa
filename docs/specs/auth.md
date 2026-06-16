# Spec écran — Auth (login / register / profil)

> Périmètre : `/login`, `/register`, `/profile`. Firebase Auth (Google popup + email/password).
> Tout est **client-side** : Firebase Auth est un SDK navigateur (cf. AUDIT §5 — « garder client-side pour `/profile` + préférences, seules pages protégées »). Aucune session cookie / middleware SSR en v1.

---

## 1. Route & placement nav

| Route | Type | Protégée | Placement nav |
|---|---|---|---|
| `/login` | écran plein (hors nav principale) | non | accessible depuis l'entrée profil (sidebar bas / top-bar) et depuis tout CTA « Se connecter » |
| `/register` | écran plein (hors nav principale) | non | lien depuis `/login` (« Pas encore de compte ? ») |
| `/profile` | écran dans le shell | **oui** | **nouvelle entrée « profil » en bas de la `Sidebar` (desktop)** et dans la `TopBar` / menu mobile — PAS dans `NAV_ENTRIES` (qui reste à 5 onglets : Fil, Médias, Podcasts, Lois, Athena) |

- Le DESIGN_SYSTEM §9 prévoit « profil en bas » de la sidebar : c'est ici qu'on branche l'avatar/CTA. La `Sidebar` actuelle (`src/components/shell/sidebar.tsx`) n'a pas encore ce bloc → à ajouter (cf. §7).
- `/login` et `/register` sont des écrans **plein écran centrés** (pas dans `AppShell`) : pas de sidebar/tab-bar, juste la marque + le formulaire. Layout dédié sous `src/app/(auth)/layout.tsx`.
- `/profile` vit **dans** le `AppShell` (colonne `max-w-[640px]`).

---

## 2. Objectif (2-3 lignes)

Permettre à un visiteur de se connecter (Google ou email/mot de passe) ou de créer un compte, afin de débloquer les fonctions personnalisées (préférences de notification, push). L'écran profil affiche l'identité Firebase + le profil serveur (`getMe`) et donne accès aux réglages (notifications, thème, déconnexion). La connexion n'est **jamais un mur** : la consultation du contenu reste possible sans compte (mode invité).

---

## 3. Données (API)

### Auth (Firebase SDK, pas l'API Athena)
Toutes les actions d'auth passent par le SDK `firebase/auth` initialisé dans `src/lib/firebase.ts` (`auth`). **Client only.**

- Connexion Google : `signInWithPopup(auth, new GoogleAuthProvider())`.
- Connexion email : `signInWithEmailAndPassword(auth, email, password)`.
- Inscription email : `createUserWithEmailAndPassword(auth, email, password)` puis `updateProfile(user, { displayName })`.
- Reset mot de passe : `sendPasswordResetEmail(auth, email)`.
- Déconnexion : `signOut(auth)`.
- État global : `onAuthStateChanged(auth, …)` exposé via un **nouveau `AuthProvider` / `useAuth()`** (n'existe pas encore — `grep` confirme zéro `onAuthStateChanged` dans le repo). Le provider expose `{ user: User | null, loading: boolean }` (le `User` Firebase).

### Profil serveur (API Athena, Bearer Firebase)
- `getMe()` → `Promise<UserProfile>` (`src/lib/api/user.ts`, via `authFetch` → `/auth/me`). **Client only** (requiert `auth.currentUser`).
- `getPreferences()` / `updatePreferences(partial)` → réglages (utilisés surtout par l'écran Préférences de notif, mais l'écran profil peut lire le thème/flags si stockés serveur). Optionnel ici.

### Server vs client
- **100 % client.** Aucun Server Component ne peut lire l'état Firebase. Les pages `/login`, `/register`, `/profile` sont des feuilles `"use client"` (ou des Server Components minces qui rendent un composant client).
- `/profile` est rendue dans le shell mais son contenu est client : si `useAuth()` renvoie `user === null` après `loading`, **redirect client** vers `/login?redirect=/profile` (pas de middleware SSR).

### Cache
- **Aucun cache HTTP** : `authFetch` est non-mémoïsé et dépend du token. `getMe` est appelé à la volée au montage de `/profile`.
- État d'auth en mémoire (provider) ; Firebase persiste la session lui-même (`browserLocalPersistence` par défaut) → pas de re-login au reload.
- Pas de pagination (aucune liste).

---

## 4. Améliorations UX proposées

1. **Google en action primaire, email en repli** — Bouton Google plein (primary) en haut, séparateur « ou », puis champs email/mdp. C'est le parcours le plus rapide et le plus fiable sur mobile. Justifié : réduit le frottement, l'email/mdp reste pour ceux sans compte Google.
2. **Un seul écran fusionné login/register avec bascule** *(au lieu de deux pages distinctes)* — `[À VALIDER]`. Garder les routes `/login` et `/register` (deep-links, SEO, CTA) mais partager le même composant `<AuthForm mode="login|register">`, avec un lien de bascule qui navigue entre les deux routes. Évite la duplication et le saut visuel.
3. **`redirect` param** — `/login?redirect=<path>` : après connexion réussie, renvoyer là où l'utilisateur voulait aller (ex. cliqué « Préférences de notif » sans être connecté). Justifié : parcours protégés sans cul-de-sac.
4. **Mot de passe oublié inline** — lien « Mot de passe oublié ? » sous le champ mdp → `sendPasswordResetEmail`, toast de confirmation. Pas d'écran séparé. Justifié : récupération sans friction.
5. **Affichage/masquage du mot de passe** (icône œil) + champ unique en inscription (pas de « confirmer le mot de passe ») avec validation de longueur ≥ 6 (contrainte Firebase). Justifié : moins de champs = plus de complétions.
6. **Mode invité explicite** `[À VALIDER]` — lien discret « Continuer sans compte » qui ferme l'écran et renvoie au Fil. Aucune connexion anonyme Firebase (pas de `signInAnonymously`) : « invité » = simplement non connecté. Le contenu est public (AUDIT §3), donc rien à débloquer ; le compte ne sert qu'aux notifications/préférences. Justifié : aligne avec « la connexion n'est jamais un mur ».
7. **Profil = hub de réglages** — l'écran `/profile` regroupe : carte identité (avatar + nom + email + provider), puis liste d'accès : « Préférences de notification » (`/profile/notifications`), toggle thème clair/sombre (réutilise `next-themes`), « Roadmap », « Informations », « Confidentialité », et bouton Déconnexion (variant `danger`). Justifié : centralise le secondaire que le DESIGN_SYSTEM voulait dans un menu « Plus ».
8. **Mapping d'erreurs Firebase → messages FR** — traduire les codes (`auth/invalid-credential`, `auth/email-already-in-use`, `auth/popup-closed-by-user`, `auth/network-request-failed`…) en phrases claires en français. Justifié : les messages Firebase bruts sont anglais et cryptiques.
9. **A2HS contextuel** `[À VALIDER]` — après une première connexion réussie, proposer (une fois) l'installation PWA, car le push iOS l'exige (AUDIT §6). Peut être différé hors de cet écran.

---

## 5. États

### `/login` & `/register`
- **loading (soumission)** : bouton en cours → spinner inline + `disabled`, champs verrouillés. Pas de skeleton (formulaire statique).
- **erreur** : bandeau d'erreur sous le bouton (texte `--danger`, rôle `alert`), message FR mappé (cf. §4.8). L'erreur popup Google fermée par l'utilisateur est silencieuse (pas un échec).
- **offline** : si `navigator.onLine === false` ou `auth/network-request-failed`, message « Connexion impossible, vérifiez votre réseau » + bouton réessayer. Pas d'OG/skeleton.
- **empty** : N/A (formulaire toujours présent).

### `/profile`
- **loading** : pendant `useAuth().loading` ET le `getMe()` initial → **skeleton** : bloc avatar circulaire `bg-surface-2` + 2 lignes de texte grisées + liste de réglages en barres skeleton.
- **non connecté** (après `loading`, `user === null`) : redirect immédiat vers `/login?redirect=/profile` (pas d'écran « vous n'êtes pas connecté »).
- **erreur `getMe`** : afficher quand même l'identité Firebase (`user.displayName/email/photoURL`) + bannière non bloquante « Profil serveur indisponible, réessayer ». L'identité de base reste utilisable.
- **offline** : afficher l'identité Firebase en cache (session persistée) ; griser les réglages qui nécessitent le réseau (préférences) avec mention hors-ligne.
- **empty** : N/A.

---

## 6. Responsive

- **`/login` & `/register`** : carte centrée. Mobile (`< lg`) : pleine largeur, gouttière 20px, marque au-dessus du formulaire, prend toute la hauteur (`min-h-dvh`, vertical-center). Desktop (`≥ lg`) : carte `max-w-[420px]` centrée sur fond `--bg`, `bg-surface` + `shadow-[--elev-2]` + `rounded-[--radius-lg]`. Pas de sidebar/tab-bar (layout `(auth)` dédié).
- **`/profile`** : dans le shell. Mobile : colonne pleine largeur sous la TopBar ; la liste de réglages occupe la largeur, items hauts (≥ 56px tactile). Desktop : colonne `max-w-[640px]` centrée ; carte identité + liste en deux colonnes possibles (icône + label / valeur). Le point d'entrée profil diffère : **avatar en bas de Sidebar** (desktop) vs **bouton dans TopBar/menu** (mobile).
- Champs : `font-size ≥ 16px` (anti-zoom iOS, DESIGN_SYSTEM §1/§12), hauteur ≥ 44px.

---

## 7. Composants

### DS existants réutilisés
- `Button` (variants `primary`, `secondary`, `ghost`, `danger`) — `src/components/ui/button.tsx`.
- `IconButton` — toggle visibilité mot de passe.
- `Switch` — `src/components/ui/switch.tsx` (toggles de réglage dans le profil le cas échéant).
- `Tag` — badge provider (« GOOGLE » / « EMAIL ») — `src/components/ui/tag.tsx`.
- `Brand` — `src/components/shell/brand.tsx` (en-tête des écrans login/register).
- `AppShell` — wrapper de `/profile`.
- Tokens & primitives Base UI (`@base-ui/react`) déjà câblés.

### NOUVEAUX composants à créer
1. **`AuthProvider` + `useAuth()`** (`src/components/providers/auth-provider.tsx`) — Context client wrappant `onAuthStateChanged` ; expose `{ user, loading }`. À monter haut dans le layout (à côté de `ThemeProvider`). **Brique fondatrice : tout le reste en dépend.**
2. **`TextField`** (`src/components/ui/text-field.tsx`) — champ input stylé DS (label, état erreur, ≥ 16px, ≥ 44px), basé sur `@base-ui/react/field` ou `<input>`. Réutilisable au-delà de l'auth.
3. **`PasswordField`** (`src/components/ui/password-field.tsx`) — `TextField` + `IconButton` œil afficher/masquer.
4. **`AuthForm`** (`src/components/auth/auth-form.tsx`) — formulaire partagé `mode="login" | "register"` : bouton Google, séparateur « ou », champs, gestion soumission/erreur, lien bascule, « mot de passe oublié ».
5. **`GoogleButton`** (`src/components/auth/google-button.tsx`) — bouton secondary avec logo Google + libellé, déclenche `signInWithPopup`.
6. **`ProfileCard`** (`src/components/auth/profile-card.tsx`) — carte identité : `Avatar` (photoURL ou initiales sur dégradé), nom, email, `Tag` provider.
7. **`SettingsList` / `SettingsRow`** (`src/components/auth/settings-list.tsx`) — liste de réglages cliquables (icône lucide + label + chevron) pour le hub profil.
8. **`SidebarProfile`** (`src/components/shell/sidebar-profile.tsx`) — bloc avatar/CTA en bas de la `Sidebar` (lien vers `/profile` si connecté, « Se connecter » sinon). À insérer dans `sidebar.tsx`.
9. **`mapAuthError(code)`** (`src/lib/auth-errors.ts`) — utilitaire de mapping codes Firebase → messages FR.

---

## 8. Interactions

- **Bouton Google** : `signInWithPopup` → succès → redirect (`redirect` param ou `/`). Popup fermée par l'utilisateur (`auth/popup-closed-by-user`) → aucun message d'erreur.
- **Soumission email (login)** : `signInWithEmailAndPassword` → succès → redirect. Échec → bandeau d'erreur FR.
- **Soumission email (register)** : `createUserWithEmailAndPassword` → `updateProfile(displayName)` → redirect. Email déjà utilisé → message + lien « Se connecter ».
- **Lien bascule** : `/login` ↔ `/register` (navigation `Link`, conserve le `redirect` param).
- **Mot de passe oublié** : ouvre un petit champ inline ou réutilise l'email saisi → `sendPasswordResetEmail` → toast succès.
- **`/profile`** :
  - clic « Préférences de notification » → `/profile/notifications`.
  - toggle thème → `next-themes` `setTheme`.
  - clic item secondaire → route correspondante.
  - **Déconnexion** : `Button` danger → confirmation (`Alert Dialog` Base UI) → `signOut(auth)` → redirect `/`.
- **Avatar sidebar** : clic → `/profile` (ou `/login` si déconnecté).
- Aucune lecture audio sur ces écrans.

---

## 9. Accessibilité

- Formulaires : chaque champ a un `<label>` associé (`htmlFor`/`id`), pas seulement un placeholder.
- Bandeau d'erreur : `role="alert"` + `aria-live="assertive"` pour annonce immédiate.
- Champ mot de passe : bouton œil avec `aria-label` (« Afficher le mot de passe » / « Masquer ») et `aria-pressed`.
- Bouton Google : libellé textuel explicite (pas qu'un logo).
- Focus clavier visible (anneau orange 2px, DESIGN_SYSTEM §12) sur champs et boutons ; ordre de tabulation logique.
- Champs ≥ 16px (anti-zoom iOS), cibles ≥ 44px.
- État de soumission annoncé (`aria-busy` sur le bouton, texte « Connexion… »).
- Dialog de déconnexion : focus trap + `aria-labelledby` (fourni par Base UI `Alert Dialog`).
- Avatar décoratif : `alt=""` si le nom est déjà à côté ; sinon `alt` = nom.

---

## 10. Décisions ouvertes

1. **Mode invité** : valider qu'« invité » = simplement non connecté (aucun `signInAnonymously`), et qu'aucun contenu n'est gated. Faut-il un lien « Continuer sans compte » visible, ou laisse-t-on l'utilisateur fermer l'écran ? (§4.6)
2. **Login/register : une page fusionnée ou deux pages distinctes ?** Routes conservées dans tous les cas ; question = composant partagé vs deux composants. (§4.2)
3. **Pseudo en inscription** : demande-t-on un `displayName` à la création de compte email, ou on le laisse vide / dérivé de l'email ?
4. **Périmètre du hub `/profile`** : quels items y mettre exactement (Roadmap, Informations, Privacy, thème) ? Le DESIGN_SYSTEM parlait d'un menu « Plus » — fusionne-t-on « Plus » et « Profil » en un seul écran, ou restent-ils séparés ?
5. **Où monter `AuthProvider`** : layout racine global (tout l'app a accès à `useAuth`) — à confirmer, vs uniquement les sous-arbres qui en ont besoin.
6. **A2HS** : déclenche-t-on le prompt d'installation après la première connexion (ici) ou ailleurs (Fil / réglages) ? (§4.9)
7. **Reset mdp inline vs route dédiée** `/reset-password` ?

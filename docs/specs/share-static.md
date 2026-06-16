# Spec écran — Share + pages statiques

> Périmètre groupé : (A) **Share deep-link** `/share/[key]/[contentId]` (preview + OG tags, SSR), (B) **pages statiques** `/informations` et `/privacy`, (C) **overlay tuto premier lancement** (flag `FIRST_LAUNCH`, pas une route). Trois surfaces distinctes mais légères, traitées dans une seule spec car partageant le même registre « chrome minimal / SSR / public ».

---

## 1. Route & placement nav

- **(A) Share** : `/share/[key]/[contentId]` (App Router, double segment dynamique ; `key` = `mediaKey`, `contentId` = id WordPress/YouTube — mêmes paramètres que `/content/[key]/[id]`).
  - **Hors navigation principale** (aucune entrée Sidebar/TabBar). Page **publique de destination** atteinte depuis un lien partagé (réseaux sociaux, messageries, scrapers OG).
  - **Server Component pur** + `generateMetadata` (OG/Twitter cards) — c'est la raison d'être de cette route (gain SEO/preview net vs l'Angular CSR, cf. AUDIT §6 « Parité SEO »).
  - Décision placement shell : voir §6 / décision ouverte #1 — **proposée sans le shell applicatif** (page d'atterrissage autonome), à valider.
- **(B) Informations** : `/informations` — accessible depuis le menu « Plus / Athena » (entrée secondaire, AUDIT §7). Vit **dans** le shell adaptatif. Server Component statique.
- **(B) Privacy** : `/privacy` — légal obligatoire, lien en pied de menu secondaire + référencé dans le manifest/footer. Server Component statique.
- **(C) Tuto premier lancement** : **pas une route**. Overlay (`Dialog` Base UI) monté au niveau du shell, déclenché par le flag `FIRST_LAUNCH` (absence de clé `localStorage`/IndexedDB). S'affiche par-dessus le Feed `/` au tout premier accès.

## 2. Objectif (2-3 lignes)

Share : offrir une **preview riche et fiable** d'un contenu partagé (image + titre + source via OG tags SSR), puis rediriger l'humain vers la lecture (`/content/:key/:id`) — la route existe d'abord pour les *scrapers* (preview cards), accessoirement pour l'utilisateur. Pages statiques : présenter le projet (Informations) et la politique de confidentialité (Privacy), sobrement et accessibles. Tuto : accueillir le primo-arrivant en 3 slides (médias libres, audio TTS, notifications) sans friction, une seule fois.

## 3. Données (API) — fonctions lib/api, server vs client, cache, pagination

| Surface | Donnée | Fonction `lib/api` | Endpoint | Où | Cache |
|---|---|---|---|---|---|
| **Share** | Métadonnées de partage (image/titre/url originale) | `getShareableContent(key, contentId)` (`content.ts`) | `GET /content/get-shareable-content/:key/:contentId` | **Server** (page + `generateMetadata`, un seul appel partagé) | `CACHE.detail` (ISR 300 s) |
| **Share** (optionnel) | Logo + titre du média source | `getListMetaMedia()` (`meta-media.ts`) → résoudre par `key` | `GET /list-meta-media` | **Server** (optionnel, parallèle) | `CACHE.list` |
| **Informations** | — | aucune (contenu en dur) | — | **Server (statique)** | rendu statique |
| **Privacy** | — | aucune (contenu en dur) | — | **Server (statique)** | rendu statique |
| **Tuto** | — | aucune (slides en dur) | — | **Client** (lit le flag local) | — |

- **Pas de pagination**, aucune donnée `live` sur ces surfaces.
- **Share — un seul fetch réutilisé** : `getShareableContent` est appelé une fois et **mémoïsé** (React `cache()` ou la dédup `fetch` native de Next) pour servir à la fois `generateMetadata` et le corps de page sans double appel. **[À VALIDER]** confirmer que la dédup s'applique (même URL + même `RequestInit`/cache).
- **Share — 404** : si `getShareableContent` échoue (404 média/contenu inconnu) → `notFound()` (page 404 Next) + `generateMetadata` renvoie des OG tags de repli génériques Athena (jamais de balises vides/cassées).
- **Tuto — flag `FIRST_LAUNCH`** : lecture/écriture **côté client uniquement**. Source de vérité = `localStorage` (clé ex. `athena.firstLaunchDone`), avec fallback IndexedDB déjà en place dans l'app (AUDIT #15 : « flag `FIRST_LAUNCH` déjà géré par le storage web »). **[À VALIDER]** localStorage suffisant (simple, synchrone, évite un flash) ou réutiliser l'abstraction storage IndexedDB existante.

## 4. Améliorations UX proposées

1. **Share — auto-redirect intelligent vers la lecture** [recommandé] — un humain qui ouvre `/share/:key/:contentId` veut *lire*, pas voir une preview. Proposition : afficher la carte de preview **et** un CTA primaire « Lire l'article / Regarder la vidéo » → `/content/:key/:id`. **[À VALIDER]** : redirection automatique après ~1,5 s (avec annulation au survol/focus) vs CTA manuel seul. La redirection auto améliore le flux mais peut surprendre et nuit au partage en cascade (re-partage de l'URL share). Recommandation : **CTA manuel par défaut**, pas d'auto-redirect.
2. **Share — détection « contexte scraper vs humain »** [À VALIDER] — inutile de sur-ingénierer : le SSR rend déjà les OG tags pour les bots ; l'humain voit la page complète. Pas de user-agent sniffing (fragile). On garde un rendu unique.
3. **Share — bloc « Continuer dans l'app »** [recommandé] — sous la preview, rappeler la valeur (audio TTS, notifications) + bouton d'installation PWA (A2HS) si applicable et non installée. Transforme un partage entrant en acquisition. Réutilise le futur prompt A2HS transverse (ne pas le re-créer ici).
4. **Informations — contenu vivant** [recommandé] — au-delà du « à propos » statique : lien vers la **Roadmap** (`/roadmap`), lien GitHub open-source, version de l'app, et un bouton « Revoir le tuto » (re-déclenche l'overlay en remettant le flag). Valorise le caractère ouvert du projet.
5. **Privacy — table des matières ancrée** [À VALIDER] — pour un texte légal long, sommaire cliquable (ancres) en haut sur desktop. Léger gain de lisibilité ; optionnel.
6. **Tuto — slides skippables + progression** [recommandé] — 3 slides avec pagination (dots), bouton « Passer » toujours visible, « Suivant » → « Commencer » au dernier. Geste swipe sur mobile. Ferme et pose le flag à « Passer » comme à « Commencer ».
7. **Tuto — slide 3 = call-to-action notifications** [À VALIDER] — terminer par une invite douce à activer les notifications push (sans déclencher la permission de force : un bouton « Activer plus tard depuis les réglages »). Évite le prompt de permission intrusif au tout premier lancement (anti-pattern). La permission réelle se demande depuis l'écran Préférences notifications.
8. **Pages statiques — métadonnées propres** [recommandé] — `generateMetadata` sur `/informations` et `/privacy` (title + description) pour le SEO, même si contenu en dur.

## 5. États

- **Loading**
  - *Share* : SSR → pas de skeleton en first load (HTML complet). En navigation SPA interne (rare), `loading.tsx` du segment = skeleton carte de preview (image 16:9 `bg-surface-2` + 2 barres titre + bloc source).
  - *Statiques* : aucun (contenu synchrone).
  - *Tuto* : aucun (slides en dur) ; pas de flash — le flag est lu avant le premier paint (cf. a11y/hydratation §9).
- **Empty**
  - *Share* : non applicable (404 → `notFound()`).
  - *Statiques* : non applicable.
  - *Tuto* : si flag déjà posé → l'overlay ne se monte jamais (état « vide » = comportement nominal silencieux).
- **Error**
  - *Share* : `getShareableContent` 404 → `notFound()` (page 404 dédiée avec lien retour au Feed). Erreur réseau autre → `error.tsx` du segment : carte « Aperçu indisponible » + lien « Ouvrir dans Athena » vers `/content/:key/:id` (le contenu peut exister même si l'aperçu échoue).
  - *Statiques* : pas d'erreur attendue (contenu local).
  - *Tuto* : si lecture du flag échoue (storage indisponible/privé) → **ne pas bloquer** : considérer le tuto comme déjà vu (ne pas l'afficher en boucle), log silencieux.
- **Offline**
  - *Share* : si la page a été visitée, servie par le cache SW (app shell). OG tags non régénérés hors-ligne (sans incidence : les scrapers sont toujours en ligne). CTA « Lire » fonctionne si le contenu est en cache.
  - *Statiques* : **entièrement cachées par le SW** (app shell / précache) — disponibles hors-ligne par nature (contenu en dur). Idéales pour le précache.
  - *Tuto* : fonctionne hors-ligne (slides + flag local), aucune dépendance réseau.

## 6. Responsive — mobile (< lg) / desktop (≥ lg)

- **Share**
  - Page d'atterrissage autonome (cf. §1) : layout **centré, max-w-[640px]**, gouttière 20 px (mobile) / 32 px (desktop). Carte de preview unique (image 16:9 → corps : kicker source + titre `display` + CTA primaire pleine largeur en mobile / inline en desktop).
  - Mobile : CTA « Lire » en bouton large tactile (≥ 44 px) ; bloc « Continuer dans l'app » sous le pli.
  - Desktop : preview plus aérée, CTA inline, éventuel visuel plus grand.
- **Statiques** : un seul rendu fluide ; texte contraint à `max-w-[640px]` centré (largeur de lecture DS §4). Mobile gouttière 20 px / desktop 32 px. Titre `display` (22) mobile → `display-lg` (28) desktop.
- **Tuto** : overlay `Dialog` Base UI — **sheet plein écran** (ou quasi) en mobile, slide-up 250 ms ; **modale centrée** (fade+scale, max ~480 px) en desktop. Swipe horizontal entre slides en mobile ; flèches/dots en desktop. Respecte `env(safe-area-inset-bottom)` pour les boutons mobiles.

## 7. Composants — DS existants réutilisés + NOUVEAUX

**Réutilisés (ne pas réinventer)** :
- `Tag` (`ui/tag.tsx`) — badge `TYPE · SOURCE` sur la preview share.
- `Button` (`ui/button.tsx`) — CTA `primary` (Lire / Commencer / Suivant), `ghost` (Passer).
- `HeroCard`-like / patterns image (`content/content-card.tsx`) — **réutiliser le rendu image 16:9 + badge source** de `HeroCard` comme base de la preview share (sans dupliquer les styles).
- `getShareableContent`, `getListMetaMedia` (`lib/api/`) — fonctions existantes, aucune nouvelle à créer pour les données.
- Shell adaptatif (`shell/`) — pour `/informations`, `/privacy` et l'overlay tuto (monté dans le shell). **Ne pas re-spécifier.**
- Dialog/Toast Base UI (DS §6) — primitives pour l'overlay tuto.

**NOUVEAUX composants à créer** :
1. **`SharePreview`** (`components/share/share-preview.tsx`, **server**) — carte d'aperçu d'un contenu partagé : image (depuis `getShareableContent`), badge source, titre, CTA « Lire dans Athena » (lien vers `/content/:key/:id`) + lien « source originale » (`originalUrl`).
2. **`ShareContinueCard`** (`components/share/share-continue-card.tsx`, **client** léger) — bloc « Continuer dans l'app » : pitch + bouton A2HS conditionnel (branché sur le futur hook/prompt PWA transverse, pas réimplémenté ici).
3. **`StaticPageLayout`** (`components/static/static-page-layout.tsx`, **server**) — wrapper éditorial partagé par `/informations` et `/privacy` : titre `display`, conteneur `max-w-[640px]`, styles de prose maison (titres, paragraphes, listes, liens orange) — mutualise la mise en page des deux pages.
4. **`OnboardingOverlay`** (`components/onboarding/onboarding-overlay.tsx`, **client**) — `Dialog` Base UI 3 slides, pagination (dots), boutons Passer/Suivant/Commencer, swipe mobile ; pose le flag à la fermeture. Monté dans le shell.
5. **`useFirstLaunch`** (`components/onboarding/use-first-launch.ts` ou `lib/`, **client hook**) — lit/écrit le flag `FIRST_LAUNCH` (localStorage + fallback storage existant), expose `{ shouldShow, dismiss, replay }` ; gère le cas storage indisponible (cf. §5 Error). `replay` sert au bouton « Revoir le tuto » d'Informations.
6. *(données statiques)* **`onboarding-slides.ts`** (`components/onboarding/`) — contenu des 3 slides (titre, texte, icône lucide) en dur, typé.

> Note : pas de nouveau composant de données — toutes les fonctions API nécessaires existent déjà dans `lib/api`.

## 8. Interactions

- **Share — clic « Lire dans Athena »** : navigation vers `/content/:key/:id` (lecture complète + audio TTS).
- **Share — clic « Source originale »** : ouvre `originalUrl` dans un nouvel onglet (`target="_blank" rel="noopener noreferrer"`).
- **Share — bouton A2HS** (si non installée) : déclenche le prompt d'installation PWA via le hook transverse.
- **Statiques — liens internes** : Informations → Roadmap, GitHub (externe), « Revoir le tuto » (appelle `replay()` du hook first-launch). Privacy → ancres (si sommaire retenu).
- **Tuto — navigation slides** : « Suivant » avance ; au dernier slide « Suivant » devient « Commencer ». « Passer » à tout moment. Swipe horizontal (mobile), flèches clavier ←/→ (desktop). Dots cliquables.
- **Tuto — fermeture** : « Commencer », « Passer », `Esc`, ou clic backdrop → ferme l'overlay **et** pose le flag (ne réapparaîtra plus). Focus rendu au contenu sous-jacent.
- **Tuto — slide notifications** (si retenu) : bouton « Plus tard » ferme sans demander la permission ; aucune permission push forcée ici.
- **Pas de lecture audio** sur ces surfaces (le player global reste disponible mais n'est pas piloté ici).

## 9. Accessibilité

- **Share** : `<h1>` unique = titre du contenu partagé ; image preview avec `alt` = titre (ou `alt=""` si purement décorative et titre déjà en texte). OG/Twitter tags complets et valides (jamais de balise vide). Liens externes annoncés (`rel`, nouvel onglet signalé).
- **Statiques** : hiérarchie de titres correcte (`<h1>` page, `<h2>` sections), contraste AA sur `--surface`, liens orange = `brand-700` en mode clair (DS §12), `max-w` pour la mesure de ligne lisible.
- **Tuto (`Dialog`)** : focus trap + `Esc` (fournis par Base UI), `aria-label`/`aria-labelledby` sur la modale, dots avec `aria-current` et labels (« Slide 2 sur 3 »), boutons avec libellés explicites. Carrousel : annoncer le changement de slide (`aria-live="polite"`). Swipe + clavier + dots = trois voies d'accès.
- **Anti-flash hydratation (tuto)** : le flag étant client-only, lire la valeur avant le premier paint de l'overlay (montage conditionnel après lecture synchrone du storage) pour éviter qu'il « clignote » puis disparaisse. Ne jamais SSR l'overlay ouvert.
- `prefers-reduced-motion` : transitions de slides et slide-up du sheet réduites aux fondus courts (DS §11).
- Cibles ≥ 44 px sur tous les boutons (CTA share, boutons tuto), focus clavier visible (anneau orange 2 px).

## 10. Décisions ouvertes

1. **Share dans le shell ou autonome ?** Page d'atterrissage publique sans Sidebar/TabBar (proposé, oriente l'acquisition) vs intégrée au shell comme les autres écrans. Impacte le layout et le sentiment « landing » vs « app ».
2. **Auto-redirect share → lecture** : redirection automatique (avec délai/annulation) ou CTA manuel seul (recommandé) ? Risque sur le re-partage de l'URL.
3. **Dédup du fetch `getShareableContent`** : confirmer que `generateMetadata` + corps de page partagent un seul appel (React `cache()` / dédup Next) — sinon mémoïser explicitement.
4. **Repli OG sur 404** : `notFound()` + OG génériques Athena suffisant, ou page de repli dédiée « contenu introuvable » avec son propre aperçu ?
5. **`/share/download` (redirection stores)** : l'AUDIT (§2 #11) prévoit une version allégée en PWA. **Hors périmètre de cette spec ?** À confirmer (route distincte, marginale).
6. **Stockage du flag `FIRST_LAUNCH`** : `localStorage` simple (proposé) ou abstraction IndexedDB existante de l'app ? Et : reset du flag pour « Revoir le tuto » — global ou per-device ?
7. **Slide notifications dans le tuto** : inclure une invite (sans permission forcée) ou rester sur 2-3 slides purement informatifs et déléguer 100 % aux Préférences notifications ?
8. **Sommaire ancré sur Privacy** : utile (texte long) ou superflu pour la v1 ?
9. **Source du contenu des pages statiques** : texte en dur dans le composant (proposé) ou MDX/CMS pour faciliter l'édition non-dev ?

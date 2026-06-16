# Spec écran — Détail proposition de loi

## 1. Route & placement nav
- Route : `/propositions/[numero]` (segment dynamique `numero`, ex. `/propositions/1234`).
- Hors navigation principale : accessible depuis une carte de la liste `/propositions` (entrée nav « Lois », `NAV_ENTRIES`). Pas d'item de nav dédié.
- L'écran vit DANS l'`AppShell` existant (sidebar desktop / tab bar mobile). L'onglet « Lois » reste actif visuellement.
- Page **Server Component** par défaut. Rendu SSR/ISR (page publique → gain SEO + OG tags pour partage deep-link).

## 2. Objectif (2-3 lignes)
Présenter une proposition de loi de manière lisible pour le grand public : basculer entre une **version simplifiée par IA** (points clés + résumés d'articles, vue par défaut) et la **version officielle** (texte intégral structuré). Mettre en avant l'auteur et les co-signataires (photos + couleurs de groupe politique) et donner accès aux documents officiels.

## 3. Données (API)
- **Fonction lib/api** : `getLawProposal(numero)` → `Promise<LawProposal>` (`src/lib/api/law-proposal.ts`, `GET /law-proposal/:numero`). 404 si absent.
- **Fetch côté serveur** dans la page (`async function Page({ params })`). `params` est une Promise dans cette version de Next → `const { numero } = await params`.
- **Cache** : `getLawProposal` utilise déjà `CACHE.detail` (ISR `revalidate: 300` / 5 min). Adapté (le texte de loi est figé ; la simplification IA peut passer de `pending` → `completed`, mais 5 min suffit ; un `revalidate` sur tag pourrait être ajouté plus tard, hors périmètre).
- Pas de pagination (détail unitaire).
- **Champs consommés** (`LawProposal`, AUDIT §4 / `types.ts`) :
  - En-tête : `titre`, `numero`, `typeProposition` (`ordinaire | constitutionnelle`), `dateMiseEnLigne`, `dateDepot`, `legislature`, `description`.
  - Auteur : `auteur: Depute` (`nom`, `groupePolitique`, `groupePolitiqueCode`, `photoUrl`, `urlDepute`).
  - Co-signataires : `coSignataires: Depute[]`.
  - Documents : `urlDocument`, `urlDossierLegislatif`.
  - Simplifié : `simplified?: SimplifiedVersion` (`status`, `generatedAt`, `keyPoints: string[]`, `exposeMotifs[]`, `articles[]`).
  - **Note** : `LawProposal` (détail) ne porte PAS `sections`/`amendements` dans `types.ts` (présents dans l'AUDIT.md mais absents du type committé). → La version « officielle » s'appuie sur `description` + `exposeMotifs` + lien vers `urlDocument`. **[À VALIDER]** si l'API renvoie réellement `sections`/`amendements` (étendre le type) ou si l'officiel se limite au PDF/dossier.
- **404** : si `getLawProposal` rejette (proposition inexistante), appeler `notFound()` (Next) → rend `not-found.tsx`.

## 4. Améliorations UX proposées
- **Onglet par défaut = Simplifié** quand `simplified.status === 'completed'`, sinon **Officiel**. Justification : la valeur produit est la version accessible ; mais ne jamais afficher une vue simplifiée vide. [À VALIDER] (défaut alternatif : toujours Simplifié avec un état « génération en cours »).
- **Badge d'état de simplification** près des onglets : `pending` → pastille « Résumé en préparation », `failed` → « Résumé indisponible » (onglet Simplifié désactivé, bascule auto sur Officiel). Évite un onglet cliquable qui mène à du vide.
- **Avatars de groupe colorés** : chaque `Depute` affiché avec un liseré/point de couleur mappé sur `groupePolitiqueCode` (table de couleurs locale, cf. §7 `GroupColor`). Donne une lecture politique instantanée. [À VALIDER] palette exacte des 12 groupes.
- **Co-signataires repliés** : afficher les ~8 premiers en grille d'avatars empilés + compteur « +N », expansion via `Collapsible`/bouton « Voir les N co-signataires ». Évite un mur de visages.
- **Partage natif** : bouton Partager (Web Share API `navigator.share`, fallback copie de lien) dans la barre d'actions — cohérent avec le reste de l'app.
- **Sommaire des articles (desktop)** : sur la vue Simplifié, ancres cliquables vers chaque article (`articles[].numero`). [À VALIDER] (peut être superflu si peu d'articles).
- **Méta-pilule type** : `typeProposition` rendu en `Tag` (ex. `CONSTITUTIONNELLE`), couleur orange pour `constitutionnelle` (cas notable).
- **Bouton retour** vers `/propositions` en haut (mobile surtout) pour ne pas dépendre du back navigateur.

## 5. États
- **Loading** : SSR → skeleton via `loading.tsx` du segment. Squelette = barre titre (2 lignes), bandeau onglets, bloc auteur (cercle + 2 lignes), 3-4 blocs de points clés (`bg-surface-2` animés `animate-pulse`).
- **Empty (par section)** :
  - `simplified` absent / `status !== 'completed'` : carte d'information dans l'onglet Simplifié (« Le résumé IA n'est pas encore disponible pour cette proposition ») + CTA « Lire la version officielle ».
  - `keyPoints` vide mais `articles` présents (ou inverse) : masquer la sous-section vide, ne pas afficher de titre orphelin.
  - `coSignataires` vide : masquer la section co-signataires (afficher seulement l'auteur).
  - `urlDossierLegislatif` null : n'afficher que le lien `urlDocument`.
- **Error** : `getLawProposal` 404 → `notFound()`. Autre erreur réseau → `error.tsx` du segment avec message FR + bouton « Réessayer » (`reset()`).
- **Offline** : page non mise en cache SW au premier accès → écran offline générique de l'app shell. Une fois visitée, le cache « dernières pages » (SW v1, AUDIT §6) permet la relecture. Pas de surinvestissement (angle mort assumé).

## 6. Responsive (bascule `lg` = 1024px)
- **Mobile (< lg)** :
  - Pleine largeur (gouttière 20px). Contenu éditorial contraint en lecture confortable.
  - Onglets Simplifié/Officiel en barre pleine largeur (sticky sous la top bar).
  - Auteur en ligne (avatar + nom + groupe). Co-signataires en grille d'avatars repliée + « +N ».
  - Barre d'actions (Partager, Documents) : boutons pleine largeur ou row scrollable.
- **Desktop (≥ lg)** :
  - Contenu éditorial centré `max-w-[640px]`.
  - [À VALIDER] colonne latérale droite optionnelle (méta : type, dates, législature, auteur, liens documents) façon « fiche », le texte restant dans la colonne centrale. Sinon tout en pile centrée.
  - Hover sur les liens députés (`urlDepute`) avec `Tooltip` (masqué en tactile).
  - Sommaire d'articles ancré possible (cf. §4).

## 7. Composants
**DS existants réutilisés :**
- `Tag` (`ui/tag.tsx`) — type de proposition, statut, libellés de groupe.
- `Button` / `IconButton` (`ui/button.tsx`) — actions (Partager, liens documents, Retour, Réessayer).
- `FilterChips` — **non**, remplacé par de vrais onglets (voir nouveau `Tabs`) car sémantique d'onglets de contenu, pas de filtre.
- `AppShell` / `Sidebar` / `TabBar` (`shell/`) — conteneur, déjà en place (non re-spécifié).
- Tokens DS (couleurs sémantiques, `font-display`, `radius`, `elev`) partout.

**NOUVEAUX composants à créer :**
1. `Tabs` (`ui/tabs.tsx`) — wrapper Base UI `Tabs` stylé DS, à usage générique (onglets Simplifié/Officiel ici, réutilisable détail loi). Client component.
2. `Avatar` (`ui/avatar.tsx`) — wrapper Base UI `Avatar`, image + fallback initiales sur dégradé, prop `ringColor` pour le liseré de groupe politique. Réutilisable (auteurs, médias).
3. `groupColors` (`lib/law/group-colors.ts`) — map `PoliticalGroupCode → { color, label }` (12 groupes + `UNKNOWN`) pour colorer avatars/badges. Pur module, pas un composant React.
4. `DeputeChip` (`components/law/depute-chip.tsx`) — avatar coloré + nom + groupe, lien externe `urlDepute` si présent. Server-friendly.
5. `CoSignataires` (`components/law/co-signataires.tsx`) — grille d'avatars empilés + compteur, expansion `Collapsible`. Client (état replié/déplié).
6. `SimplifiedView` (`components/law/simplified-view.tsx`) — rend `keyPoints` (liste à puces accentuées), `exposeMotifs` (sections titrées), `articles` (cartes numéro + résumé). Server.
7. `OfficialView` (`components/law/official-view.tsx`) — rend `description` + `exposeMotifs` texte intégral + appel à action vers `urlDocument`/`urlDossierLegislatif`. Server.
8. `LawProposalHeader` (`components/law/proposal-header.tsx`) — titre (`font-display`), `numero`, `Tag` type, dates formatées FR, législature. Server.
9. `DocumentLinks` (`components/law/document-links.tsx`) — boutons vers `urlDocument` (« Texte officiel PDF ») et `urlDossierLegislatif` (« Dossier législatif »), icônes `FileText` / `ExternalLink`. Server.
10. `ShareButton` (`components/law/share-button.tsx`) — Web Share API + fallback copie, toast confirmation. Client (réutilisable ailleurs, à généraliser éventuellement). [À VALIDER] mutualiser avec un futur `ShareButton` global.

## 8. Interactions
- **Onglets Simplifié / Officiel** : bascule via `Tabs` (clavier fléché, `aria-selected` gérés par Base UI). Onglet Simplifié désactivé si `status !== 'completed'`.
- **Co-signataires** : clic « Voir les N co-signataires » → déplie la grille complète (`Collapsible`). Clic sur un député (si `urlDepete`/`urlDepute` non null) → ouvre la fiche Assemblée en nouvel onglet (`target="_blank" rel="noopener"`).
- **Documents** : clic ouvre `urlDocument` / `urlDossierLegislatif` en nouvel onglet (`window.open`/`<a target=_blank>`).
- **Partager** : `navigator.share({ title, url })`, fallback copie presse-papier + toast.
- **Retour** : `<Link href="/propositions">` (ou `router.back()` si provenance interne).
- **Sommaire articles** (desktop, si retenu) : clic → scroll ancré (`#article-<numero>`), `scroll-behavior: smooth` (respect `prefers-reduced-motion`).
- Pas de lecture audio sur cet écran.

## 9. Accessibilité
- `Tabs` Base UI : rôles `tablist`/`tab`/`tabpanel` + navigation clavier fournis ; libellés explicites (« Version simplifiée », « Version officielle »).
- Avatars : `alt` = nom du député ; le point/liseré de couleur est **décoratif** → l'appartenance politique doit aussi être en **texte** (`groupePolitique`), jamais couleur seule (daltonisme + contraste AA).
- Liens externes : `aria-label` explicite (« Fiche de <nom> sur l'Assemblée nationale, nouvel onglet »).
- Titre de page `<h1>` = `titre` de la proposition ; hiérarchie `h2`/`h3` pour points clés / exposé / articles.
- Focus clavier visible (anneau orange 2px) sur onglets, liens, boutons.
- Boutons icône (Partager, Retour) avec `aria-label`.
- `prefers-reduced-motion` respecté (expansion co-signataires, scroll ancré).
- Contraste : couleurs de groupe utilisées en liseré/point sur surface, jamais comme fond de texte sans vérif AA.

## 10. Décisions ouvertes
1. **Champs `sections`/`amendements`** : présents dans AUDIT.md mais absents du type `LawProposal` committé. L'API les renvoie-t-elle ? Si oui, étendre `types.ts` et enrichir `OfficialView`. Sinon l'officiel = `description` + `exposeMotifs` + PDF.
2. **Onglet par défaut** : Simplifié si `completed`, sinon Officiel — ou toujours Simplifié avec état « en préparation » ?
3. **Palette des 12 groupes politiques** (`groupColors`) : valider les couleurs (RN, LFI_NFP, SOC, ECO, GDR, EPR, DEM, HOR, DR, UDR, NI, UNKNOWN) — y a-t-il une charte existante (webapp/mobile) à reprendre ?
4. **Layout desktop** : colonne latérale « fiche » (méta + documents) ou pile centrée simple `max-w-[640px]` ?
5. **Sommaire d'articles** ancré (desktop) : utile ou superflu selon le nombre typique d'articles ?
6. **ShareButton** : composant dédié loi ou à généraliser dès maintenant en composant global réutilisé par Contenu/Podcast ?
7. **Formatage des dates** : confirmer le format FR cible (ex. « déposée le 12 mars 2025 ») et la lib (Intl natif vs date-fns).

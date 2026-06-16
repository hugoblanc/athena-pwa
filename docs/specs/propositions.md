# Spec écran — Propositions de loi (liste)

## 1. Route & placement nav
- **Route** : `/propositions` (Server Component, `app/propositions/page.tsx`).
- **Nav** : entrée principale `NAV_ENTRIES` déjà déclarée — sidebar desktop libellé « Propositions de loi », tab bar mobile libellé court « Lois », icône `Scale` (lucide). Item actif = aplat orange (géré par le shell).
- **Détail** : chaque carte ouvre `/propositions/[numero]` (écran séparé, hors périmètre).
- **Filtres dans l'URL** : tous les filtres sont des **search params** (`?groupe=RN,SOC&type=ordinaire&statut=completed&tri=date_desc&page=2`) pour rendre les listes filtrées partageables, indexables (SSR/ISR) et compatibles « back ».

## 2. Objectif (2-3 lignes)
Donner une vue parcourable et filtrable des propositions de loi déposées à l'Assemblée, avec repérage politique immédiat (auteur + couleur de groupe) et signal « version simplifiée IA disponible ». L'utilisateur cible un texte par groupe politique / type / statut de simplification, puis ouvre le détail.

## 3. Données (API)
- **Fonction** : `listLawProposals(filters: LawProposalFilters)` de `lib/api/law-proposal.ts` → `UnifiedPage<LawProposalSummary>`.
- **Champs exploités** (`LawProposalSummary`) : `numero`, `titre`, `typeProposition`, `dateMiseEnLigne`, `dateDepot`, `auteur` (`Depute` : `nom`, `groupePolitique`, `groupePolitiqueCode`, `photoUrl`), `coSignatairesCount`, `simplified?.status` + `simplified?.keyPoints`.
- **Server vs client** :
  - **Server Component** (`page.tsx`) : lit les `searchParams`, mappe vers `LawProposalFilters`, appelle `listLawProposals` côté serveur (SSR/ISR, OG-friendly, pas de flash). Rend la liste + la pagination initiale.
  - **Client** (feuilles) : barre de filtres (`<LawFilterBar>`) qui pousse les params dans l'URL via `router.replace(...)` (navigation soft, le RSC re-render avec les nouvelles données) ; bouton « Charger plus » client qui re-fetch la page suivante.
- **Mapping filtres UI → `LawProposalFilters`** :
  - `groupe` (CSV de `PoliticalGroupCode`) → `groupePolitique: string[]`.
  - `type` → `typeProposition: 'ordinaire' | 'constitutionnelle'`.
  - `statut` → `simplificationStatus: 'completed' | 'pending' | 'failed'`.
  - `tri` → `sort` (`dateMiseEnLigne:desc` défaut, `dateMiseEnLigne:asc`, `titre:asc`, `numero:desc`). Whitelist côté serveur.
  - `page` → `page` ; `limit` fixé à 20.
  - `include` : laisser le défaut API (`simplified,auteur`) — la carte a besoin des deux.
- **Cache** : `CACHE.list` (ISR 60 s) déjà appliqué dans `listLawProposals`. Pas de `live` (données quasi-statiques). Détail = `CACHE.detail` (écran séparé).
- **Pagination** : `UnifiedPage.hasNext` / `page` / `totalPages` / `total`. Stratégie **« Charger plus » append** (voir §8) plutôt que pages numérotées : plus naturel mobile, garde l'URL `?page=N` comme point d'ancrage SSR.
- **Stats** (optionnel, [À VALIDER]) : `getLawStats()` pour afficher un compteur d'en-tête (« 1 248 propositions, 312 simplifiées »).

## 4. Améliorations UX proposées
- **[OK] Filtres dans l'URL** : listes filtrées partageables + SEO + back fonctionnel (cf. §1). Justification : feature « pure HTTP » destinée au SSR (AUDIT §6).
- **[OK] Pastille couleur politique** : chaque carte porte un liseré/point de la couleur du `groupePolitiqueCode` → lecture politique instantanée sans lire le texte. Map de couleurs dédiée (voir §7, `politicalGroupColor`).
- **[OK] Badge « Simplifié »** : si `simplified?.status === 'completed'`, badge orange « ✦ Version simplifiée » → met en avant la plus-value IA de la feature. Si `pending`, badge neutre « Simplification en cours ». Si absent/`failed`, rien.
- **[OK] Aperçu key points** : sous le titre, afficher le 1er `keyPoints` (clamp 1 ligne, `--text-dim`) quand `completed` → donne le fond du texte sans ouvrir le détail.
- **[OK] Filtre groupe multi-sélection** : `groupePolitique` est un tableau côté API → permettre de cocher plusieurs groupes (ex. comparer NFP). UI = `Select` multiple ou panneau de chips à cocher.
- **[À VALIDER] Compteur de résultats** + chip « Effacer les filtres » quand au moins un filtre actif.
- **[À VALIDER] Tri « Récemment simplifiées »** : tri client/serveur mettant en tête les `completed` récents — valorise l'angle IA, mais nécessite un `sort` non documenté côté API (à confirmer, sinon retiré).
- **[À VALIDER] Filtre rapide « Simplifiées uniquement »** en chip d'en-tête (raccourci de `statut=completed`), en plus du sélecteur complet.

## 5. États
- **Loading** : `<LawProposalCardSkeleton>` ×6 (barre titre 2 lignes + ligne auteur + pastille). Au changement de filtre, garder la liste précédente en `opacity-60` + skeletons en bas plutôt qu'un flash vide (transition douce). Sur « Charger plus » : spinner sur le bouton.
- **Empty (aucun résultat)** : illustration sobre (icône `Scale` ou `SearchX`), titre « Aucune proposition ne correspond », sous-texte « Essayez d'élargir vos filtres », bouton secondaire « Effacer les filtres ». Distinguer **empty-filtré** (avec reset) de **empty-total** (« Aucune proposition pour l'instant », sans reset).
- **Error** : carte d'erreur centrée, message « Impossible de charger les propositions », bouton « Réessayer » (re-fetch). En SSR, `error.tsx` du segment.
- **Offline** : bannière fine en haut « Hors ligne — données potentiellement périmées ». Si le SW a la dernière liste en cache (app shell + dernières pages, AUDIT §offline), l'afficher en lecture seule ; sinon état error avec « Réessayer ». Filtres désactivés (grisés) hors ligne car nécessitent un fetch réseau.

## 6. Responsive
- **Mobile (`< lg`)** :
  - Filtres : rangée de **chips scrollables** pour le tri + un bouton « Filtres » qui ouvre une **feuille `Dialog` bas** (`Sheet`) contenant groupe (multi), type, statut. Compteur de filtres actifs en pastille sur le bouton.
  - Cartes en **1 colonne**, pleine largeur, gouttière 20 px. Avatar auteur 36 px.
  - « Charger plus » pleine largeur en bas.
- **Desktop (`≥ lg`)** :
  - Filtres **inline** en barre horizontale (sélecteurs `Select` côte à côte : Groupe / Type / Statut / Tri), pas de feuille. Compteur de résultats à droite.
  - Cartes en **1 colonne** dans la colonne contenu centrée (`max-w-[640px]` du shell). Hover carte : `-translate-y-px` + bordure primary (cohérent `ContentCard`).
  - Titre de page `display-lg` (28 px) en tête ; masqué/réduit en mobile.

## 7. Composants
**DS existants réutilisés :**
- `FilterChips` (`ui/filter-chips.tsx`) — sélection unique pour le **tri** (et le raccourci « Simplifiées »).
- `Tag` (`ui/tag.tsx`) — badge type (`ORDINAIRE`/`CONSTITUTIONNELLE`) ; variante `orange` pour le badge « Simplifié ».
- `Button` / icon button (`ui/button.tsx`) — « Charger plus », « Réessayer », « Effacer les filtres », bouton « Filtres » mobile.
- Tokens/cartes : réutiliser le pattern visuel de `ContentCard` (`bg-surface border-border rounded-[--radius] shadow-elev-1 p-3.5`, hover identique). Avatar via Base UI `Avatar` (fallback initiales — voir DS §6).

**NOUVEAUX composants à créer :**
1. `LawProposalCard` (`components/law/law-proposal-card.tsx`) — carte liste : avatar auteur (couleur de groupe en anneau) + nom + groupe, titre (`card-title` clamp 2 lignes), badges (type + Simplifié), 1er key point, méta (`numero` · date `dateMiseEnLigne`). Lien englobant vers `/propositions/[numero]`. **Server Component** (présentation pure).
2. `PoliticalGroupBadge` (`components/law/political-group-badge.tsx`) — pastille/puce libellé groupe colorée selon `groupePolitiqueCode` ; utilise `politicalGroupColor`.
3. `politicalGroupColor` (`lib/law/political-groups.ts`) — map `PoliticalGroupCode → { color, label }` (couleurs officielles AN : RN bleu marine, LFI rouge, SOC rose, ECO vert, etc. ; `UNKNOWN`/`NI` gris neutre). Exporte aussi la liste ordonnée pour le filtre.
4. `LawFilterBar` (`components/law/law-filter-bar.tsx`, `"use client"`) — orchestre tri (`FilterChips`) + sélecteurs Groupe/Type/Statut ; responsive (inline desktop / feuille mobile) ; écrit dans l'URL.
5. `LawFilterSheet` (`components/law/law-filter-sheet.tsx`, `"use client"`) — feuille `Dialog` mobile encapsulant les sélecteurs multi.
6. `LawProposalList` (`components/law/law-proposal-list.tsx`, `"use client"` pour le « Charger plus ») — reçoit la 1re page (SSR) en props, gère l'append + états loading/empty/error.
7. `LawProposalCardSkeleton` — placeholder loading.
8. `EmptyState` générique (si pas déjà présent dans `ui/`) — réutilisable empty/error.

## 8. Interactions
- **Clic carte** : navigation `/propositions/[numero]` (lien englobant, toute la carte). Pas d'action secondaire intra-carte (garder un seul lien pour l'a11y, cf. ContentCard).
- **Changer un filtre** : met à jour `searchParams` via `router.replace(url, { scroll: false })` → le Server Component re-render avec la nouvelle liste ; reset `page=1` à chaque changement de filtre.
- **Tri** (`FilterChips`) : idem, met à jour `tri`.
- **Charger plus** : bouton client → fetch `listLawProposals({ ...filters, page: next })` (route handler ou server action), append des items, masqué quand `hasNext === false`. [À VALIDER] alternative : infinite scroll (IntersectionObserver) avec fallback bouton.
- **Effacer les filtres** : remet l'URL à `/propositions`.
- **Gestes mobile** : feuille filtres = swipe-down pour fermer (Base UI `Dialog`). Pas de lecture audio sur cet écran.
- **Scroll restoration** : conserver la position au retour depuis le détail (Next App Router gère ; vérifier avec l'append).

## 9. Accessibilité
- Couleur politique **jamais seule porteuse d'info** : toujours accompagnée du libellé texte du groupe (la pastille est redondante, pas exclusive). Vérifier contraste AA du texte sur la couleur de groupe (utiliser texte foncé/clair adaptatif, pas la couleur de groupe en texte sur fond surface si < AA).
- Carte = `<Link>` unique avec libellé accessible complet (titre + auteur + groupe) ; badges décoratifs en `aria-hidden` si redondants.
- Filtres : `Select`/feuille Base UI (clavier + ARIA fournis). Bouton « Filtres » mobile annonce le nombre de filtres actifs (`aria-label="Filtres, 2 actifs"`).
- Liste annoncée : sur changement de filtre, `aria-live="polite"` sur le compteur de résultats (« 42 propositions »).
- Cibles ≥ 44 px (chips, boutons, avatar cliquable). Focus orange 2 px visible partout.
- Skeletons `aria-hidden` ; conteneur liste `aria-busy` pendant le fetch.
- `prefers-reduced-motion` : pas de translate sur hover/append.

## 10. Décisions ouvertes
1. **Tri « Récemment simplifiées »** : l'API supporte-t-elle un `sort` sur l'état/date de simplification, ou tri purement par `dateMiseEnLigne`/`titre`/`numero` ? (impacte l'amélioration §4).
2. **Pagination** : « Charger plus » (proposé) vs infinite scroll vs pages numérotées — confirmer le pattern voulu.
3. **Compteur d'en-tête via `getLawStats()`** : afficher des stats globales (total, % simplifiées) en tête de page, ou rester sobre (juste le total `UnifiedPage.total`) ?
4. **Couleurs des groupes** : valider la palette `politicalGroupColor` (couleurs officielles AN) — sensibilité politique, neutralité éditoriale à confirmer.
5. **Filtre date** (`dateDebut`/`dateFin` existent dans l'API) : l'exposer dans cette v1 (sélecteur de période) ou le réserver à une itération ultérieure ?
6. **Filtre groupe** : multi-sélection (proposé, l'API prend un CSV) confirmé, ou mono-sélection plus simple en v1 ?

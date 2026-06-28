/**
 * Métadonnées de la dimension « type » d'une idée (roadmap PWA).
 * Aligne le vocabulaire sur l'app mobile (segments Média / Idées / Bugs) et sur
 * le backend (`idea.type` ∈ feature | media | bug). `media` = demande d'ajout
 * d'une source de contenu (≈ moitié des idées), distincte des fonctionnalités.
 */
export const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "feature", label: "Idées" },
  { value: "media", label: "Médias" },
  { value: "bug", label: "Bugs" },
];

/** Valeurs de type acceptées dans l'URL (`?type=`). Défaut = feature. */
export const VALID_TYPE = new Set(TYPE_FILTERS.map((f) => f.value));
export const DEFAULT_TYPE = "feature";

/** Libellés contextuels (CTA, modale, état vide) par type. */
export const TYPE_COPY: Record<
  string,
  {
    cta: string;
    dialogTitle: string;
    dialogDescription: string;
    titlePlaceholder: string;
    bodyPlaceholder: string;
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  feature: {
    cta: "Proposer une idée",
    dialogTitle: "Proposer une idée",
    dialogDescription:
      "Athena est open-source. Décrivez l'idée, la communauté pourra voter pour l'orienter.",
    titlePlaceholder: "Ex. Ajouter un mode hors-ligne",
    bodyPlaceholder: "Contexte, cas d'usage, comportement attendu…",
    emptyTitle: "Aucune idée pour l'instant",
    emptyDescription:
      "Soyez le premier à proposer une amélioration. Les idées les plus votées orientent les priorités.",
  },
  media: {
    cta: "Proposer un média",
    dialogTitle: "Proposer un média",
    dialogDescription:
      "Suggérez une source de contenu (chaîne, site, podcast) à agréger dans Athena. Votez pour prioriser les ajouts.",
    titlePlaceholder: "Ex. Ajouter Le Monde Diplomatique",
    bodyPlaceholder: "Lien du site / de la chaîne, type de contenu…",
    emptyTitle: "Aucun média proposé",
    emptyDescription:
      "Suggérez une source de contenu à ajouter. Les plus demandées sont intégrées en priorité.",
  },
  bug: {
    cta: "Signaler un bug",
    dialogTitle: "Signaler un bug",
    dialogDescription:
      "Décrivez le problème rencontré : ce que vous faisiez, ce qui était attendu, ce qui s'est passé.",
    titlePlaceholder: "Ex. Le lecteur audio se coupe en arrière-plan",
    bodyPlaceholder: "Étapes pour reproduire, appareil, comportement observé…",
    emptyTitle: "Aucun bug signalé",
    emptyDescription:
      "Rien à signaler pour l'instant. Décrivez tout problème que vous rencontrez.",
  },
};

---
name: roadmap-priorities
description: Récupère et synthétise les priorités produit d'Athena (ce qu'il faut développer ensuite) à partir des votes des utilisateurs sur la roadmap. À utiliser quand l'utilisateur demande quelles features développer, ce que les utilisateurs réclament, les demandes les plus votées, les priorités de la roadmap, ou "qu'est-ce qu'on fait ensuite".
---

# Roadmap priorities — que développer ensuite

Synthétise les demandes des utilisateurs d'Athena (roadmap) pour décider quoi
construire. La source de vérité est l'API NestJS (`athena_api`), table `idea`.

## Endpoint

```
GET https://www.athena-app.fr/issues/priorities?limit=15
```

Public (pas d'auth). `limit` (1–50, défaut 15) borne les listes « top ».

Réponse :
```jsonc
{
  "totals": { "open": 203, "done": 71, "rejected": 6, "planned": 0, "in_progress": 0 },
  "topFeatures": [ { "id", "title", "votes", "type", "url" }, ... ], // ouvertes, les + votées
  "topBugs":     [ ... ],                                            // bugs ouverts, les + votés
  "planned":     [ ... ],                                            // déjà validées (à planifier)
  "inProgress":  [ ... ]                                             // en chantier
}
```
`url` pointe vers la page détail PWA (`/roadmap/:id`) où l'on voit les commentaires.

## Marche à suivre

1. Récupérer les données :
   ```bash
   curl -s "https://www.athena-app.fr/issues/priorities?limit=15"
   ```
   (Pour la base **locale** en dev : `http://localhost:3000/issues/priorities`.)

2. Présenter une synthèse claire et actionnable :
   - **Top features à arbitrer** : titre + nb de votes + lien, triées par votes.
   - **Top bugs** à corriger (votes).
   - **Validé / En cours** s'il y en a (`planned` / `inProgress`).
   - Rappeler les `totals` (combien d'idées ouvertes au total).

3. **Caveat médias** : une grande partie des demandes ouvertes les plus votées
   sont des « ajouter le média X » (Mediapart, Reporterre, Nexus, ACRIMED…).
   Ce sont des demandes d'ajout de source, pas des features de dev — les
   signaler à part pour ne pas fausser la priorisation produit. Repère-les aux
   titres en « ajouter / add … » désignant un média.

4. Si l'utilisateur veut agir sur un statut (valider / refuser / passer en
   cours), pointer vers `athena_api/scripts/set-idea-status.ts` :
   ```bash
   npx ts-node -r tsconfig-paths/register scripts/set-idea-status.ts <statut> <id...>
   # statuts : open | planned | in_progress | done | rejected
   ```

## Notes

- L'endpoint vit dans `athena_api/src/idea/` (`IdeaController.priorities` →
  `IdeaService.getPriorities`). Réponse typée `PrioritiesDto`.
- Les votes = clap des utilisateurs (1 vote / personne, dédup serveur). Le
  compteur initial inclut les votes historiques importés depuis GitHub.

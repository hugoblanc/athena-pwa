import { QaConversation } from "@/components/qa/qa-conversation";
import { getQaHistory } from "@/lib/api/qa";
import type { QaHistoryItem } from "@/lib/api/types";

export const metadata = {
  title: "Demander à Athena",
  description:
    "Pose une question sur l'actualité des médias libres et reçois une réponse sourcée.",
};

/**
 * Écran Q&A `/qa`. RSC : hydrate la première page d'historique sans flash,
 * puis délègue tout le cycle interactif (ask → stream → result) au composant
 * client `QaConversation`. QA public → lecture libre, aucun gate d'auth.
 */
export default async function QaPage() {
  let history: QaHistoryItem[] = [];
  let hasNext = false;

  try {
    const page = await getQaHistory({ page: 1, limit: 20 });
    history = page.items;
    hasNext = page.hasNext;
  } catch {
    // Historique indisponible (endpoint hors-ligne / invité) → on démarre vide.
  }

  return (
    <QaConversation initialHistory={history} initialHasNext={hasNext} />
  );
}

import { API_BASE_URL } from "./config";

/**
 * Sondage in-app ciblé par géolocalisation (campagne « iran »).
 *
 * L'éligibilité est décidée CÔTÉ SERVEUR à partir du pays geoip de l'IP du
 * visiteur : le client ne peut pas se déclarer éligible. On n'envoie aucune
 * donnée personnelle (pas d'IP) ; seul un texte libre + un contact optionnel.
 */

export interface SurveyEligibility {
  survey: string;
  country: string | null;
  eligible: boolean;
}

/** Le visiteur (d'après son pays geoip) doit-il voir ce sondage ? */
export async function getSurveyEligibility(
  survey = "iran",
): Promise<SurveyEligibility> {
  const res = await fetch(
    `${API_BASE_URL}/survey/eligibility?survey=${encodeURIComponent(survey)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Survey eligibility: ${res.status}`);
  return res.json();
}

/** Envoie une réponse de sondage. 403 si le pays geoip ne correspond pas. */
export async function submitSurveyFeedback(input: {
  survey?: string;
  message: string;
  contact?: string;
  locale?: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/survey/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ survey: "iran", ...input }),
  });
  if (!res.ok) throw new Error(`Survey feedback: ${res.status}`);
}

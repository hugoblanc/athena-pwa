import { apiGet } from "./client";
import { API_BASE_URL, CACHE } from "./config";
import type { Issue } from "./types";

/**
 * Domaine Roadmap / Issues (GitHub).
 *
 * ⚠️ TROU BACKEND (cf. docs/specs/roadmap.md §10) : l'API NestJS n'expose que
 * deux endpoints ÉCRITURE (`POST /issues`, `POST /issues/:id/clap`). Il n'existe
 * AUCUN `GET` propre pour LISTER les issues → la liste in-app n'est pas
 * affichable avec le contrat actuel. `listIssues()` est donc fourni en
 * prévision (option (a) du §10) mais N'EST PAS appelé en v1.
 */

/** Crée une issue. `POST /issues` (public, pas d'auth). Pattern : `askQuestion()`. */
export async function createIssue(input: {
  title: string;
  body?: string;
}): Promise<Issue> {
  const res = await fetch(`${API_BASE_URL}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Issue create: ${res.status}`);
  return res.json();
}

/** Incrémente le clap d'une issue. `POST /issues/:id/clap` (public). */
export async function clapIssue(issueId: number): Promise<Issue> {
  const res = await fetch(`${API_BASE_URL}/issues/${issueId}/clap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Issue clap: ${res.status}`);
  return res.json();
}

/**
 * Liste les issues. `GET /issues` propre — ⚠️ ENDPOINT À CRÉER CÔTÉ API.
 * Non utilisé en v1 (cf. en-tête). Conservé pour activer la liste dès que le
 * backend l'expose, sans toucher aux écrans.
 */
export async function listIssues(): Promise<Issue[]> {
  return apiGet<Issue[]>("/issues", CACHE.list);
}

/** URL publique du dépôt GitHub (issues open-source). */
export const ATHENA_REPO_URL = "https://github.com/hugoblanc/Athena";
export const ATHENA_REPO_ISSUES_URL =
  "https://github.com/hugoblanc/Athena/issues";

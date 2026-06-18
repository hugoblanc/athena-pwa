import { getAnonKey } from "../anon-key";
import { apiGet } from "./client";
import { API_BASE_URL, CACHE } from "./config";
import type { Issue } from "./types";

/**
 * Domaine Roadmap / Idées.
 *
 * Migré des GitHub issues vers la BDD (cf. athena_api/src/idea). L'API expose
 * désormais `GET /issues` (liste), `GET /issues/:id` (détail), `POST /issues`
 * (création) et `POST /issues/:id/clap` (vote, dédup serveur via X-Anon-Key
 * pour les invités, ou Bearer Firebase pour les comptes).
 */

/** Entête de dédup anonyme (no-op côté serveur où getAnonKey() est undefined). */
function anonHeader(): Record<string, string> {
  const key = getAnonKey();
  return key ? { "X-Anon-Key": key } : {};
}

/** Crée une idée. `POST /issues` (public). */
export async function createIssue(input: {
  title: string;
  body?: string;
}): Promise<Issue> {
  const res = await fetch(`${API_BASE_URL}/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...anonHeader() },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Issue create: ${res.status}`);
  return res.json();
}

/** Incrémente le vote d'une idée. `POST /issues/:id/clap` (public, dédup serveur). */
export async function clapIssue(issueId: number): Promise<Issue> {
  const res = await fetch(`${API_BASE_URL}/issues/${issueId}/clap`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...anonHeader() },
  });
  if (!res.ok) throw new Error(`Issue clap: ${res.status}`);
  return res.json();
}

/** Liste les idées (RSC). `GET /issues`. */
export async function listIssues(): Promise<Issue[]> {
  return apiGet<Issue[]>("/issues", CACHE.list);
}

/** URL publique du dépôt GitHub (issues open-source). */
export const ATHENA_REPO_URL = "https://github.com/hugoblanc/Athena";
export const ATHENA_REPO_ISSUES_URL =
  "https://github.com/hugoblanc/Athena/issues";

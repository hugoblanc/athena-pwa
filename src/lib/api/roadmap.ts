import { getAnonKey } from "../anon-key";
import { authFetch } from "./auth-client";
import { apiGet } from "./client";
import { API_BASE_URL, CACHE } from "./config";
import type { IdeaComment, Issue } from "./types";

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

/** Crée une idée. `POST /issues` (public). `type` ∈ feature | media | bug (défaut serveur : feature). */
export async function createIssue(input: {
  title: string;
  body?: string;
  type?: string;
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

/** Retire le vote d'une idée (toggle). `DELETE /issues/:id/clap`. */
export async function unclapIssue(issueId: number): Promise<Issue> {
  const res = await fetch(`${API_BASE_URL}/issues/${issueId}/clap`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...anonHeader() },
  });
  if (!res.ok) throw new Error(`Issue unclap: ${res.status}`);
  return res.json();
}

/**
 * Vote « contre » une idée (-1). `POST /issues/:id/downvote`.
 * AUTH FIREBASE requise (Bearer via authFetch) — contrairement au clap anonyme.
 * Renvoie l'idée avec `voteCount` (net) à jour.
 */
export async function downvoteIssue(issueId: number): Promise<Issue> {
  return authFetch<Issue>(`/issues/${issueId}/downvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}

/** Retire le vote contre (toggle). `DELETE /issues/:id/downvote` (auth requise). */
export async function removeDownvote(issueId: number): Promise<Issue> {
  return authFetch<Issue>(`/issues/${issueId}/downvote`, {
    method: "DELETE",
  });
}

/** Liste les idées (RSC). `GET /issues`. */
export async function listIssues(): Promise<Issue[]> {
  return apiGet<Issue[]>("/issues", CACHE.list);
}

/** Détail d'une idée. `GET /issues/:id`. */
export async function getIssue(id: number): Promise<Issue> {
  return apiGet<Issue>(`/issues/${id}`, CACHE.detail);
}

/** Commentaires d'une idée (public). `GET /issues/:id/comments`. */
export async function getComments(id: number): Promise<IdeaComment[]> {
  return apiGet<IdeaComment[]>(`/issues/${id}/comments`, CACHE.live);
}

/** Poste un commentaire (connexion requise). `POST /issues/:id/comments`. */
export async function postComment(
  id: number,
  text: string,
): Promise<IdeaComment> {
  return authFetch<IdeaComment>(`/issues/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

/** URL publique du dépôt GitHub (issues open-source). */
export const ATHENA_REPO_URL = "https://github.com/hugoblanc/Athena";
export const ATHENA_REPO_ISSUES_URL =
  "https://github.com/hugoblanc/Athena/issues";

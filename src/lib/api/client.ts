import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public path: string,
    message?: string,
  ) {
    super(message ?? `API ${status} sur ${path}`);
    this.name = "ApiError";
  }
}

/**
 * Encode un segment de chemin d'API. Les clés/ids viennent d'URLs, de params de
 * route et de Server Actions : sans encodage, un `../` ou un `?` réécrit
 * l'endpoint appelé.
 */
export function segment(value: string | number): string {
  return encodeURIComponent(String(value));
}

export function positiveInt(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} invalide : ${value}`);
  }
  return value;
}

/**
 * Résout `path` contre l'API Athena et refuse tout ce qui en sort. Un `path`
 * protocole-relatif (`//evil.com/x`) ou absolu provoquerait une SSRF côté
 * serveur et une fuite du Bearer Firebase côté client.
 */
export function resolveApiUrl(path: string): URL {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE_URL);
  if (url.origin !== new URL(API_BASE_URL).origin) {
    throw new ApiError(400, path, `Chemin d'API hors domaine : ${path}`);
  }
  return url;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = resolveApiUrl(path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v == null) continue;
      url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
    }
  }
  return url.toString();
}

export type QueryParams = Record<
  string,
  string | number | boolean | string[] | undefined | null
>;

export interface RequestOptions extends RequestInit {
  query?: QueryParams;
}

/**
 * GET sur un endpoint PUBLIC de l'API Athena (utilisable serveur + client).
 * Pour les endpoints protégés (/auth/*), voir `auth-client.ts` (client only).
 */
export async function apiGet<T>(
  path: string,
  { query, ...init }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, query);
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init.headers },
  });
  if (!res.ok) {
    throw new ApiError(res.status, path, await safeText(res));
  }
  // Un 2xx au corps vide (ressource absente côté API) ne doit pas crasher en
  // « Unexpected end of JSON input » : on lève une erreur explicite.
  const body = await res.text();
  if (!body) {
    throw new ApiError(res.status, path, `Réponse vide sur ${path}`);
  }
  return JSON.parse(body) as T;
}

async function safeText(res: Response): Promise<string | undefined> {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

/**
 * `sources` du QA est stocké en JSON-string côté Prisma (AUDIT §3).
 * Parseur défensif pour éviter tout crash.
 */
export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

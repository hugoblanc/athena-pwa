import { apiGet, parseJsonField } from "./client";
import { API_BASE_URL, CACHE } from "./config";
import {
  fromPaginationPage,
  type PaginationPage,
  type UnifiedPage,
} from "./pagination";
import type { QaHistoryItem, QaSource } from "./types";

/** Pose une question → renvoie un jobId à streamer. `POST /qa/ask` */
export async function askQuestion(
  question: string,
): Promise<{ jobId: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/qa/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`QA ask: ${res.status}`);
  return res.json();
}

/**
 * URL du flux SSE d'une réponse. À consommer côté client via `EventSource`
 * (QA public → pas de header auth requis, ce qui contourne la limite
 * EventSource/headers — cf. AUDIT §6).
 */
export function qaStreamUrl(jobId: string): string {
  return `${API_BASE_URL}/qa/stream/${jobId}`;
}

/** Résultat final d'une réponse. `GET /qa/result/:jobId` */
export async function getQaResult(jobId: string): Promise<QaHistoryItem> {
  const raw = await apiGet<QaHistoryItem & { sources: unknown }>(
    `/qa/result/${jobId}`,
    CACHE.live,
  );
  return { ...raw, sources: parseJsonField<QaSource[]>(raw.sources, []) };
}

/** Historique des questions. `GET /qa/history` */
export async function getQaHistory(params: {
  page?: number;
  limit?: number;
}): Promise<UnifiedPage<QaHistoryItem>> {
  const res = await apiGet<PaginationPage<QaHistoryItem & { sources: unknown }>>(
    "/qa/history",
    { query: { page: params.page, limit: params.limit }, ...CACHE.live },
  );
  const page = fromPaginationPage(res);
  return {
    ...page,
    items: page.items.map((it) => ({
      ...it,
      sources: parseJsonField<QaSource[]>(it.sources, []),
    })),
  };
}

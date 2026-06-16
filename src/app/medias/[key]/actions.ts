"use server";

import { getContentByMediaKey } from "@/lib/api/content";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { Content } from "@/lib/api/types";

/**
 * Charge une page de contenus d'un média (infinite scroll côté client).
 * Pagination 1-based, cohérente avec l'API content.
 */
export async function loadMoreMediaContent(
  key: string,
  page: number,
): Promise<UnifiedPage<Content>> {
  return getContentByMediaKey(key, page);
}

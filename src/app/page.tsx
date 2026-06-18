import { getTranslations } from "next-intl/server";
import { FeedClient } from "@/components/feed/feed-client";
import type { FeedType } from "@/components/feed/feed-utils";
import { mediaKeysForType } from "@/components/feed/feed-utils";
import { getLastContent } from "@/lib/api/content";
import { getMetaMedias } from "@/lib/api/meta-media";
import type { UnifiedPage } from "@/lib/api/pagination";
import type { ContentLite, ListMetaMedia } from "@/lib/api/types";

const PAGE_SIZE = 10;

function parseType(raw: string | string[] | undefined): FeedType {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "video" || v === "article" ? v : "all";
}

function parseTerms(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (v ?? "").trim();
}

/**
 * Fil d'actu (`/`) — Server Component.
 * Fetch SSR/ISR de la 1ère page + des médias (en parallèle) pour le SEO et
 * le first paint instantané, puis délégation à `FeedClient` pour l'état
 * recherche/filtres/infinite-scroll.
 */
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const terms = parseTerms(sp.q);
  const type = parseType(sp.type);
  const t = await getTranslations("feed");

  let medias: ListMetaMedia[] = [];
  let initialPage: UnifiedPage<ContentLite> = {
    items: [],
    page: 1,
    hasNext: false,
  };

  try {
    medias = await getMetaMedias();
    initialPage = await getLastContent({
      page: 1,
      size: PAGE_SIZE,
      terms: terms || undefined,
      mediaKeys: mediaKeysForType(type, medias),
    });
  } catch {
    // Fetch SSR en échec → on rend quand même la coquille ; le client
    // affichera l'EmptyState / permettra un réessai via les filtres.
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-4 lg:pt-6">
      <h1 className="mb-4 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        {t("title")}
      </h1>

      <FeedClient
        initialPage={initialPage}
        medias={medias}
        initialTerms={terms}
        initialType={type}
      />
    </div>
  );
}

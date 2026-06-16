import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaContentList } from "@/components/content/media-content-list";
import { MediaHeader } from "@/components/content/media-header";
import { getContentByMediaKey } from "@/lib/api/content";
import { getMetaMedias } from "@/lib/api/meta-media";
import type { MetaMedia } from "@/lib/api/types";
import { loadMoreMediaContent } from "./actions";

export const revalidate = 60;

/** Dérive un MetaMedia depuis l'annuaire (pas d'endpoint « média par key »). */
async function findMedia(key: string): Promise<MetaMedia | undefined> {
  const groups = await getMetaMedias();
  return groups
    .flatMap((g) => g.metaMedias ?? [])
    .find((m) => m.key === key);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const media = await findMedia(key);
  if (!media) return { title: "Média introuvable" };
  return {
    title: media.title,
    description: `Tous les contenus de ${media.title} agrégés par Athena.`,
  };
}

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  const [media, firstPage] = await Promise.all([
    findMedia(key),
    getContentByMediaKey(key, 1),
  ]);

  if (!media) notFound();

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <MediaHeader media={media} total={firstPage.total} />
      <MediaContentList
        initialPage={firstPage}
        mediaKey={media.key}
        mediaTitle={media.title}
        mediaUrl={media.url}
        loadMore={loadMoreMediaContent}
      />
    </div>
  );
}

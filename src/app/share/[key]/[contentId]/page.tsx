import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SharePreview } from "@/components/share/share-preview";
import { ShareContinueCard } from "@/components/share/share-continue-card";
import { getShareableContent } from "@/lib/api/content";
import { getMetaMedias } from "@/lib/api/meta-media";
import { ApiError } from "@/lib/api/client";
import type {
  MetaMedia,
  ShareableContentResponse,
} from "@/lib/api/types";

interface ShareParams {
  params: Promise<{ key: string; contentId: string }>;
}

/**
 * Fetch mémoïsé (React `cache`) du contenu partagé : un seul appel réseau
 * partagé entre `generateMetadata` et le corps de page. Renvoie `null` sur
 * 404 (média/contenu inconnu) plutôt que de jeter — le page body déclenche
 * alors `notFound()`, les métadonnées tombent sur un repli générique Athena.
 */
const loadShareable = cache(
  async (
    key: string,
    contentId: string,
  ): Promise<ShareableContentResponse | null> => {
    try {
      return await getShareableContent(key, contentId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
);

/** Résout le média source par sa clé (logo + titre), sans bloquer si absent. */
const loadMedia = cache(async (key: string): Promise<MetaMedia | null> => {
  try {
    const groups = await getMetaMedias();
    for (const g of groups) {
      const found = g.metaMedias.find((m) => m.key === key);
      if (found) return found;
    }
    return null;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: ShareParams): Promise<Metadata> {
  const { key, contentId } = await params;
  const data = await loadShareable(key, contentId);

  if (!data) {
    // Repli générique : jamais d'OG tags vides/cassés.
    return {
      title: "Contenu introuvable",
      description: "Ce contenu partagé n'est plus disponible sur Athena.",
    };
  }

  const media = await loadMedia(key);
  const description = media
    ? `Partagé depuis ${media.title} · à lire et écouter sur Athena.`
    : "À lire et écouter sur Athena, l'agrégateur des médias libres.";
  const image = data.image?.url
    ? [{ url: data.image.url, width: data.image.width, height: data.image.height }]
    : undefined;

  return {
    title: data.title,
    description,
    openGraph: {
      type: "article",
      title: data.title,
      description,
      siteName: "Athena",
      url: data.originalUrl || undefined,
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: data.title,
      description,
      images: image ? [data.image.url] : undefined,
    },
  };
}

export default async function SharePage({ params }: ShareParams) {
  const { key, contentId } = await params;
  const data = await loadShareable(key, contentId);

  if (!data) notFound();

  const media = await loadMedia(key);
  const isVideo = media?.type === "YOUTUBE";
  const contentHref = `/content/${key}/${contentId}`;

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:px-8 lg:pt-8">
      <SharePreview
        data={data}
        contentHref={contentHref}
        source={media?.title}
        isVideo={isVideo}
      />
      <ShareContinueCard />
    </div>
  );
}

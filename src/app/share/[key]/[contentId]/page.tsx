import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { NotifyOptInSheet } from "@/components/notif/notify-opt-in-sheet";
import { SharePreview } from "@/components/share/share-preview";
import { ShareFunnel } from "@/components/share/share-funnel";
import { getShareableContent } from "@/lib/api/content";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/config";
import { absoluteUrl, sharePath } from "@/lib/site";
import type { ShareableContentResponse } from "@/lib/api/types";

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

  const description = data.mediaTitle
    ? `Partagé depuis ${data.mediaTitle} · à lire et écouter sur Athena.`
    : "À lire et écouter sur Athena, l'agrégateur des médias libres.";
  // OG image brandée générée et servie par l'API (cache volume) : carte 1200×630
  // aux couleurs Athena + média source, au lieu de la miniature brute YouTube/
  // WordPress. Améliore le CTR du lien partagé et la mémorisation de la marque.
  const ogImage = `${API_BASE_URL}/content/${encodeURIComponent(
    key,
  )}/${encodeURIComponent(contentId)}/og.png`;

  return {
    title: data.title,
    description,
    openGraph: {
      type: "article",
      title: data.title,
      description,
      siteName: "Athena",
      // URL canonique Athena (pas l'URL du média externe) : le clic doit
      // ramener sur la landing de partage, pas quitter vers la source.
      url: absoluteUrl(sharePath.content(key, contentId)),
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SharePage({ params }: ShareParams) {
  const { key, contentId } = await params;
  const data = await loadShareable(key, contentId);

  if (!data) notFound();

  const isVideo = data.mediaType === "YOUTUBE";
  const contentHref = `/content/${key}/${contentId}`;

  return (
    <div className="mx-auto max-w-[560px] px-5 pt-5 lg:pt-8">
      <SharePreview
        data={data}
        contentHref={contentHref}
        source={data.mediaTitle}
        isVideo={isVideo}
      />
      <ShareFunnel
        refType="content"
        refId={contentId}
        sharePath={sharePath.content(key, contentId)}
        title={data.title}
        source={data.mediaTitle}
      />
      {/* Opt-in notif après ~12 s de lecture (non bloquant). */}
      <NotifyOptInSheet mediaTitle={data.mediaTitle} />
    </div>
  );
}

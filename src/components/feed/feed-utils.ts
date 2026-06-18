import type {
  ContentCardData,
  HeroCardData,
} from "@/components/content/content-card";
import type { ContentLite, ListMetaMedia } from "@/lib/api/types";
import { formatRelative, readingTimeFromWordCount } from "@/lib/format";

/** Onglets de type (le filtre `type` API n'existe pas → dérivé en `mediaKeys`). */
export type FeedType = "all" | "video" | "article";

/** Ordre des filtres ; les libellés sont traduits côté composant (`feed.chips.*`). */
export const FEED_TYPES: FeedType[] = ["all", "video", "article"];

const TYPE_TO_MEDIA: Record<Exclude<FeedType, "all">, "YOUTUBE" | "WORDPRESS"> =
  {
    video: "YOUTUBE",
    article: "WORDPRESS",
  };

/**
 * Aplatit les groupes de médias en une liste de clés du type demandé.
 * « Vidéos » = médias YOUTUBE, « Articles » = médias WORDPRESS.
 * `all` → `undefined` (pas de filtre média).
 */
export function mediaKeysForType(
  type: FeedType,
  groups: ListMetaMedia[],
): string[] | undefined {
  if (type === "all") return undefined;
  const wanted = TYPE_TO_MEDIA[type];
  const keys = groups
    .flatMap((g) => g.metaMedias)
    .filter((m) => m.type === wanted)
    .map((m) => m.key);
  return keys.length ? keys : undefined;
}

/** Libellé de type pour le tag des cartes. */
function typeLabel(type: ContentLite["metaMedia"]["type"]): string {
  return type === "YOUTUBE" ? "Vidéo" : "Article";
}

/** Lien détail contenu. */
export function contentHref(c: ContentLite): string {
  return `/content/${c.metaMedia.key}/${c.contentId}`;
}

/** `ContentLite` → données de `ContentCard`. */
export function toCardData(c: ContentLite): ContentCardData {
  const isVideo = c.metaMedia.type === "YOUTUBE";
  return {
    href: contentHref(c),
    tag: `${typeLabel(c.metaMedia.type)} · ${c.metaMedia.title}`,
    title: c.title,
    meta: formatRelative(c.publishedAt),
    image: c.image?.url,
    isVideo,
    // Badge temps de lecture : calculé depuis wordCount si le backend l'expose,
    // sinon absent (pas de badge trompeur). Vidéos exclues.
    readingTime: isVideo ? undefined : readingTimeFromWordCount(c.wordCount) ?? undefined,
  };
}

/** `ContentLite` → données de `HeroCard` (1er contenu du fil). */
export function toHeroData(c: ContentLite): HeroCardData {
  const isVideo = c.metaMedia.type === "YOUTUBE";
  return {
    href: contentHref(c),
    source: c.metaMedia.title,
    kicker: `À la une · ${typeLabel(c.metaMedia.type)}`,
    title: c.title,
    excerpt: "",
    meta: formatRelative(c.publishedAt),
    image: c.image?.url,
    isVideo,
    readingTime: isVideo ? undefined : readingTimeFromWordCount(c.wordCount) ?? undefined,
  };
}

import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PodcastNav } from "@/components/podcast/podcast-nav";
import { PodcastPlayPanel } from "@/components/podcast/podcast-play-panel";
import { PodcastTranscript } from "@/components/podcast/podcast-transcript";
import { Tag } from "@/components/ui/tag";
import { ShareButton } from "@/components/ui/share-button";
import { formatDate } from "@/lib/format";
import {
  getNextPodcast,
  getPodcast,
  getPreviousPodcast,
} from "@/lib/api/podcast";
import type { Podcast } from "@/lib/api/types";

/** Tolère l'échec de getNext/getPrevious (404 en bord de liste). */
async function safe(p: Promise<Podcast>): Promise<Podcast | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const podcast = await getPodcast(id);
    return { title: `${podcast.content?.title ?? "Podcast"} — Athena` };
  } catch {
    return { title: "Podcast — Athena" };
  }
}

/** `/podcasts/[id]` — lecteur détaillé (Now Playing inline + nav prev/next). */
export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let podcast: Podcast;
  try {
    podcast = await getPodcast(id);
  } catch {
    notFound();
  }

  if (!podcast) notFound();

  const [previous, next] = await Promise.all([
    safe(getPreviousPodcast(id)),
    safe(getNextPodcast(id)),
  ]);

  const content = podcast.content;
  const title = content?.title ?? "Podcast Athena";
  const sourceKey = content?.meta_media?.key;
  const sourceTitle = content?.meta_media?.title ?? "Athena";
  const sourceHref =
    sourceKey && content?.contentId
      ? `/content/${sourceKey}/${content.contentId}`
      : null;

  const shareUrl = `/podcasts/${podcast.id}`;

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-32 pt-4 lg:pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href="/podcasts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-dim transition-colors hover:text-text"
        >
          <ArrowLeft className="size-4" />
          Podcasts
        </Link>
        <ShareButton
          data={{ title, url: shareUrl }}
          variant="icon"
          label="Partager ce podcast"
        />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Tag orange>Audio · {sourceTitle}</Tag>
        {content?.publishedAt && (
          <span className="text-xs text-text-dim">
            {formatDate(content.publishedAt)}
          </span>
        )}
      </div>

      <PodcastPlayPanel podcast={podcast} />

      {sourceHref && (
        <Link
          href={sourceHref}
          className="group mt-4 flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3.5 shadow-elev-1 transition-[border-color] hover:border-primary"
        >
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-faint">
              Contenu source
            </div>
            <div className="truncate font-display text-sm font-bold">
              {title}
            </div>
          </div>
          <ExternalLink className="size-5 shrink-0 text-text-dim group-hover:text-primary" />
        </Link>
      )}

      {podcast.dialogueText && (
        <div className="mt-4">
          <PodcastTranscript text={podcast.dialogueText} />
        </div>
      )}

      <div className="mt-6">
        <PodcastNav previous={previous} next={next} />
      </div>
    </div>
  );
}

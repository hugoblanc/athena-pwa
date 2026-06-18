import { ArrowLeft, ThumbsUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClapButton } from "@/components/roadmap/clap-button";
import { CommentSection } from "@/components/roadmap/comment-section";
import { StatusBadge } from "@/components/roadmap/status-badge";
import { ApiError } from "@/lib/api/client";
import { getComments, getIssue } from "@/lib/api/roadmap";
import type { IdeaComment, Issue } from "@/lib/api/types";

const NON_VOTABLE = new Set(["done", "rejected"]);

async function fetchIssue(id: number): Promise<Issue> {
  try {
    return await getIssue(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const issue = await getIssue(Number(id));
    return {
      title: `${issue.title} — Roadmap`,
      description: issue.body?.slice(0, 160) ?? undefined,
    };
  } catch {
    return { title: "Roadmap — Athena" };
  }
}

export default async function RoadmapIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ideaId = Number(id);
  if (!Number.isFinite(ideaId)) notFound();

  const issue = await fetchIssue(ideaId);
  // Commentaires non bloquants : un échec ne casse pas la page.
  let comments: IdeaComment[] = [];
  try {
    comments = await getComments(ideaId);
  } catch {
    comments = [];
  }

  const votes = issue.claps ?? 0;
  const votable = !NON_VOTABLE.has(issue.status ?? "open");

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-24 pt-4 lg:pb-10 lg:pt-6">
      <Link
        href="/roadmap"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-dim transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Roadmap
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <StatusBadge status={issue.status ?? "open"} className="mb-2.5" />
          <h1 className="font-display text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
            {issue.title}
          </h1>
        </div>

        {votable ? (
          <ClapButton issueId={ideaId} count={votes} title={issue.title} />
        ) : (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-text-faint"
            aria-label={`${votes} vote${votes > 1 ? "s" : ""}`}
          >
            <ThumbsUp className="size-[15px]" aria-hidden />
            {votes}
          </span>
        )}
      </div>

      {issue.body && (
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-text-dim">
          {issue.body}
        </p>
      )}

      <CommentSection ideaId={ideaId} initialComments={comments} />
    </div>
  );
}

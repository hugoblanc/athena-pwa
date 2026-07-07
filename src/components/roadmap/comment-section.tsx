"use client";

import Link from "next/link";
import { CommentThread } from "@/components/comments/comment-thread";
import { postComment } from "@/lib/api/roadmap";
import type { IdeaComment } from "@/lib/api/types";

/**
 * Fil de discussion d'une idée. Lecture publique ; pour commenter il faut un
 * compte (le vote, lui, reste anonyme). Simple habillage de `CommentThread`.
 */
export function CommentSection({
  ideaId,
  initialComments,
}: {
  ideaId: number;
  initialComments: IdeaComment[];
}) {
  return (
    <CommentThread
      initialComments={initialComments}
      placeholder="Partagez votre avis, un cas d'usage…"
      onSubmit={(text) => postComment(ideaId, text)}
      guestCta={
        <div className="rounded-[var(--radius)] border border-border bg-surface-2 p-4 text-sm text-text-dim">
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Connectez-vous
          </Link>{" "}
          pour participer à la discussion. Le vote, lui, reste possible sans
          compte.
        </div>
      }
    />
  );
}

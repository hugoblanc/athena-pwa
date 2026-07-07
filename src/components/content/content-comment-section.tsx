"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { CommentThread } from "@/components/comments/comment-thread";
import {
  deleteContentComment,
  getContentCommentsAuthed,
  postContentComment,
} from "@/lib/api/content";
import type { IdeaComment } from "@/lib/api/types";

/**
 * Fil de discussion sous un article. Lecture publique ; commenter exige un
 * compte → le CTA pousse la création de compte (avec retour à l'article après
 * inscription via `?redirect`). Chacun peut supprimer ses propres commentaires.
 */
export function ContentCommentSection({
  contentId,
  initialComments,
}: {
  contentId: number;
  initialComments: IdeaComment[];
}) {
  const pathname = usePathname();
  const redirect = encodeURIComponent(pathname);

  const refetchOnAuth = useCallback(
    () => getContentCommentsAuthed(contentId),
    [contentId],
  );

  return (
    <CommentThread
      title="Commentaires"
      placeholder="Réagissez à cet article…"
      emptyLabel="Aucun commentaire pour l'instant. Soyez le premier à réagir."
      initialComments={initialComments}
      onSubmit={(text) => postContentComment(contentId, text)}
      onDelete={(comment) => deleteContentComment(contentId, comment.id)}
      refetchOnAuth={refetchOnAuth}
      guestCta={
        <div className="rounded-[var(--radius)] border border-border bg-surface-2 p-4">
          <p className="text-sm text-text-dim">
            Rejoignez la communauté Athena pour réagir aux articles et proposer
            des idées.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link
              href={`/register?redirect=${redirect}`}
              className="inline-flex h-9 items-center rounded-[var(--radius)] bg-primary px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-hover"
            >
              Créer un compte
            </Link>
            <Link
              href={`/login?redirect=${redirect}`}
              className="text-[13px] font-medium text-text-dim hover:text-text"
            >
              {"J'ai déjà un compte"}
            </Link>
          </div>
        </div>
      }
    />
  );
}

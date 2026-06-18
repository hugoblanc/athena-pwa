"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { postComment } from "@/lib/api/roadmap";
import type { IdeaComment } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";

const BODY_MAX = 2000;

const textareaClass =
  "min-h-[88px] w-full resize-y rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]";

/**
 * Fil de discussion d'une idée. Lecture publique ; pour commenter il faut un
 * compte (le vote, lui, reste anonyme). Liste hydratée depuis le serveur et
 * complétée de façon optimiste à l'envoi.
 */
export function CommentSection({
  ideaId,
  initialComments,
}: {
  ideaId: number;
  initialComments: IdeaComment[];
}) {
  const { user, loading } = useAuth();
  const [comments, setComments] = useState<IdeaComment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await postComment(ideaId, trimmed);
      setComments((prev) => [created, ...prev]);
      setText("");
    } catch {
      setError("Échec de l'envoi, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 font-display text-[17px] font-extrabold tracking-[-0.01em]">
        Discussion{comments.length > 0 && ` · ${comments.length}`}
      </h2>

      {/* Zone de saisie / invite à se connecter */}
      {loading ? null : user ? (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2.5">
          <textarea
            className={textareaClass}
            placeholder="Partagez votre avis, un cas d'usage…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={BODY_MAX}
            aria-label="Votre commentaire"
          />
          {error && (
            <p role="status" className="text-[13px] text-danger">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-faint">
              {text.length}/{BODY_MAX}
            </span>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !text.trim()}
            >
              {submitting ? "Envoi…" : "Commenter"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-[var(--radius)] border border-border bg-surface-2 p-4 text-sm text-text-dim">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Connectez-vous
          </Link>{" "}
          pour participer à la discussion. Le vote, lui, reste possible sans
          compte.
        </div>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p className="text-sm text-text-faint">
          Aucun commentaire pour l'instant. Lancez la discussion.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {comments.map((c) => {
            const name = c.author.displayName?.trim() || "Anonyme";
            return (
              <li key={c.id} className="flex gap-3">
                <Avatar src={c.author.photoUrl} name={name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] font-semibold">{name}</span>
                    <span className="text-[12px] text-text-faint">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className={cn("mt-0.5 whitespace-pre-wrap text-[14px] text-text-dim")}>
                    {c.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

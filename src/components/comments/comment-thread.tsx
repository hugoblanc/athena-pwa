"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { IdeaComment } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";

const BODY_MAX = 2000;

const textareaClass =
  "min-h-[88px] w-full resize-y rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]";

/**
 * Fil de discussion générique (idées ou articles). Lecture publique ; l'écriture
 * passe par `onSubmit` (connexion requise, gérée par l'appelant via `guestCta`).
 * Si `onDelete` est fourni, un bouton « supprimer » s'affiche sur les
 * commentaires marqués `isMine`. `refetchOnAuth` recharge la liste authentifiée
 * au montage pour obtenir ces `isMine` (le rendu serveur est anonyme).
 */
export function CommentThread({
  initialComments,
  title = "Discussion",
  placeholder = "Partagez votre avis…",
  emptyLabel = "Aucun commentaire pour l'instant. Lancez la discussion.",
  guestCta,
  onSubmit,
  onDelete,
  refetchOnAuth,
}: {
  initialComments: IdeaComment[];
  title?: string;
  placeholder?: string;
  emptyLabel?: string;
  guestCta: ReactNode;
  onSubmit: (text: string) => Promise<IdeaComment>;
  onDelete?: (comment: IdeaComment) => Promise<void>;
  refetchOnAuth?: () => Promise<IdeaComment[]>;
}) {
  const { user, loading } = useAuth();
  const [comments, setComments] = useState<IdeaComment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const refetchedFor = useRef<string | null>(null);

  // Recharge la liste en authentifié une fois connecté → renseigne `isMine`.
  useEffect(() => {
    if (!user || !refetchOnAuth || refetchedFor.current === user.uid) return;
    refetchedFor.current = user.uid;
    refetchOnAuth()
      .then(setComments)
      .catch(() => {
        /* liste publique déjà affichée : on garde l'existant */
      });
  }, [user, refetchOnAuth]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await onSubmit(trimmed);
      setComments((prev) => [created, ...prev]);
      setText("");
    } catch {
      setError("Échec de l'envoi, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(comment: IdeaComment) {
    if (!onDelete) return;
    setConfirmingId(null);
    const previous = comments;
    setComments((cs) => cs.filter((c) => c.id !== comment.id));
    try {
      await onDelete(comment);
    } catch {
      setComments(previous);
      setError("Échec de la suppression, réessayez.");
    }
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 font-display text-[17px] font-extrabold tracking-[-0.01em]">
        {title}
        {comments.length > 0 && ` · ${comments.length}`}
      </h2>

      {/* Zone de saisie / invite à se connecter */}
      {loading ? null : user ? (
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2.5">
          <textarea
            className={textareaClass}
            placeholder={placeholder}
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
        <div className="mb-6">{guestCta}</div>
      )}

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <p className="text-sm text-text-faint">{emptyLabel}</p>
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
                    {onDelete && c.isMine && (
                      <span className="ml-auto flex items-center gap-2">
                        {confirmingId === c.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="text-[12px] font-semibold text-danger hover:underline"
                            >
                              Supprimer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingId(null)}
                              className="text-[12px] text-text-faint hover:text-text-dim"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingId(c.id)}
                            aria-label="Supprimer mon commentaire"
                            className="text-text-faint transition-colors hover:text-danger"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        )}
                      </span>
                    )}
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

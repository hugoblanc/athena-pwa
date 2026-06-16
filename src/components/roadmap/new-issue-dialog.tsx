"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { createIssue } from "@/lib/api/roadmap";
import { cn } from "@/lib/cn";

const TITLE_MAX = 120;
const BODY_MAX = 1500;

const textareaClass =
  "min-h-[120px] w-full resize-y rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]";

/**
 * Modale de création d'une demande d'amélioration. `POST /issues` (public).
 * Titre requis ; description markdown léger optionnelle. Feedback inline
 * (succès / erreur) faute de provider Toast monté dans le shell.
 */
export function NewIssueDialog({
  trigger,
}: {
  /** Élément déclencheur (bouton header desktop ou FAB mobile). */
  trigger: React.ReactElement;
}) {
  const router = useRouter();
  const titleId = useId();
  const bodyId = useId();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setSubmitting(false);
    setError(null);
    setDone(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Un titre est requis.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createIssue({
        title: trimmed,
        body: body.trim() || undefined,
      });
      setDone(true);
      router.refresh();
    } catch {
      setError("Échec de l'envoi, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Dialog.Trigger render={trigger} />

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex flex-col gap-4 border border-border bg-surface p-5 shadow-elev-1 outline-none",
            // Mobile : sheet bas plein largeur
            "inset-x-0 bottom-0 rounded-t-[18px] pb-[max(20px,env(safe-area-inset-bottom))]",
            "transition-transform duration-250 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            // Desktop : carte centrée fade+scale
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(480px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[18px] sm:pb-5",
            "sm:transition-[transform,opacity] sm:data-[ending-style]:translate-y-[-50%] sm:data-[ending-style]:scale-95 sm:data-[ending-style]:opacity-0 sm:data-[starting-style]:translate-y-[-50%] sm:data-[starting-style]:scale-95 sm:data-[starting-style]:opacity-0",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
              Proposer une amélioration
            </Dialog.Title>
            <Dialog.Close
              render={
                <IconButton aria-label="Fermer" className="size-9 [&_svg]:size-[18px]" />
              }
            >
              <X />
            </Dialog.Close>
          </div>

          {done ? (
            <div className="flex flex-col gap-4 py-2">
              <p className="text-sm text-text-dim">
                Merci, votre proposition a bien été envoyée. Elle apparaîtra
                bientôt sur la roadmap.
              </p>
              <Dialog.Close render={<Button variant="primary">Fermer</Button>} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Dialog.Description className="text-sm text-text-dim">
                Athena est open-source. Décrivez l&apos;idée ou le problème, la
                communauté pourra voter pour l&apos;orienter.
              </Dialog.Description>

              <div className="flex flex-col gap-1.5">
                <TextField
                  id={titleId}
                  label="Titre"
                  placeholder="Ex. Ajouter un mode hors-ligne"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX}
                  autoFocus
                  required
                />
                <span className="self-end text-[11px] text-text-faint">
                  {title.length}/{TITLE_MAX}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={bodyId} className="text-[13px] font-semibold">
                  Description{" "}
                  <span className="font-normal text-text-faint">
                    (optionnel)
                  </span>
                </label>
                <textarea
                  id={bodyId}
                  className={textareaClass}
                  placeholder="Contexte, cas d'usage, comportement attendu…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={BODY_MAX}
                />
                <span className="self-end text-[11px] text-text-faint">
                  {body.length}/{BODY_MAX}
                </span>
              </div>

              {error && (
                <p role="status" className="text-[13px] text-danger">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2.5">
                <Dialog.Close render={<Button variant="ghost">Annuler</Button>} />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !title.trim()}
                >
                  <Plus aria-hidden />
                  {submitting ? "Envoi…" : "Publier"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

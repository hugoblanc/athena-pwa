"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog } from "@base-ui/react/dialog";
import { History, Trash2, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { IconButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/api/config";
import { getQaHistory } from "@/lib/api/qa";
import { formatRelative } from "@/lib/format";
import type { QaHistoryItem } from "@/lib/api/types";

const PAGE_SIZE = 20;

/** Supprime un item d'historique. `DELETE /qa/history/:id` */
async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/qa/history/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`QA delete: ${res.status}`);
}

function HistoryRow({
  item,
  onOpen,
  onDeleted,
}: {
  item: QaHistoryItem;
  onOpen: (item: QaHistoryItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteHistoryItem(item.id);
      onDeleted(item.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="group flex items-start gap-2 rounded-[var(--radius)] border border-border bg-surface p-3 transition-colors hover:border-text-faint">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="line-clamp-2 text-[14px] font-semibold text-text">
          {item.question}
        </div>
        <div className="mt-1 text-[11.5px] text-text-dim">
          {formatRelative(item.createdAt)}
        </div>
      </button>

      <AlertDialog.Root>
        <AlertDialog.Trigger
          render={
            <button
              type="button"
              aria-label="Supprimer cette question"
              className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-sm)] text-text-faint transition-colors hover:bg-danger/10 hover:text-danger"
            />
          }
        >
          <Trash2 className="size-4" />
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-40px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-elev-2 outline-none transition-[opacity,transform] duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none">
            <AlertDialog.Title className="font-display text-[16px] font-bold">
              Supprimer cette question ?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-[13.5px] text-text-dim">
              L&apos;échange sera retiré de ton historique. Cette action est
              définitive.
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Close
                render={
                  <button
                    type="button"
                    className="rounded-[var(--radius)] bg-surface-2 px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:bg-border"
                  />
                }
              >
                Annuler
              </AlertDialog.Close>
              <AlertDialog.Close
                onClick={confirmDelete}
                disabled={deleting}
                render={
                  <button
                    type="button"
                    className="rounded-[var(--radius)] bg-danger px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  />
                }
              >
                Supprimer
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

/**
 * Panneau d'historique QA — sheet latéral (Base UI Dialog). Déclenché par une
 * icône horloge. Liste paginée, suppression confirmée, clic = recharge l'échange.
 */
export function QaHistoryPanel({
  initialItems,
  initialHasNext,
  onSelect,
}: {
  initialItems: QaHistoryItem[];
  initialHasNext: boolean;
  onSelect: (item: QaHistoryItem) => void;
}) {
  const [items, setItems] = useState<QaHistoryItem[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const loadMore = useCallback(() => {
    const next = page + 1;
    startTransition(async () => {
      try {
        const res = await getQaHistory({ page: next, limit: PAGE_SIZE });
        setItems((prev) => [...prev, ...res.items]);
        setPage(next);
        setHasNext(res.hasNext);
      } catch {
        /* silencieux : l'utilisateur peut réessayer */
      }
    });
  }, [page]);

  const handleSelect = useCallback(
    (item: QaHistoryItem) => {
      onSelect(item);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <IconButton aria-label="Ouvrir l'historique des questions" />
        }
      >
        <History />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-border bg-bg shadow-elev-2 outline-none transition-transform duration-200 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full motion-reduce:transition-none">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <Dialog.Title className="font-display text-[16px] font-bold">
              Historique
            </Dialog.Title>
            <Dialog.Close
              render={
                <IconButton aria-label="Fermer l'historique" className="size-9" />
              }
            >
              <X />
            </Dialog.Close>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="px-1 py-8 text-center text-[13.5px] text-text-dim">
                Aucune question pour le moment.
              </p>
            ) : (
              items.map((it) => (
                <HistoryRow
                  key={it.id}
                  item={it}
                  onOpen={handleSelect}
                  onDeleted={(id) =>
                    setItems((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))
            )}

            {pending && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-[var(--radius)]" />
                ))}
              </div>
            )}

            {hasNext && !pending && (
              <button
                type="button"
                onClick={loadMore}
                className="w-full rounded-[var(--radius)] bg-surface-2 px-4 py-2.5 text-[13px] font-semibold text-text-dim transition-colors hover:text-text"
              >
                Charger l&apos;historique plus ancien
              </button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

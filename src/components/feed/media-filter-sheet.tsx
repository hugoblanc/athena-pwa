"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { MediaMultiSelect } from "@/components/content/media-multi-select";
import { Button, IconButton } from "@/components/ui/button";
import type { ListMetaMedia } from "@/lib/api/types";

/**
 * Feuille de sélection des médias du fil (Dialog Base UI, ancrée en bas).
 * Médias groupés par catégorie, cases à cocher. Édite un brouillon local et
 * applique à la validation — miroir du pattern `LawFilterSheet`.
 */
export function MediaFilterSheet({
  open,
  onOpenChange,
  groups,
  selected,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ListMetaMedia[];
  selected: string[];
  onApply: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(selected);

  // Resync le brouillon à chaque ouverture (l'état persistant fait foi).
  function handleOpenChange(next: boolean) {
    if (next) setDraft(selected);
    onOpenChange(next);
  }

  function toggle(key: string) {
    setDraft((d) =>
      d.includes(key) ? d.filter((k) => k !== key) : [...d, key],
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-[var(--radius-lg)] border-t border-border bg-surface shadow-elev-2 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full transition-transform duration-200 motion-reduce:transition-none">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <Dialog.Title className="font-display text-lg font-extrabold">
              Filtrer par média
            </Dialog.Title>
            <Dialog.Close render={<IconButton aria-label="Fermer" />}>
              <X />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
            <MediaMultiSelect
              groups={groups}
              selected={draft}
              onToggle={toggle}
            />
          </div>

          <div className="flex gap-2.5 border-t border-border px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
            {draft.length > 0 && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDraft([])}
              >
                Tout effacer
              </Button>
            )}
            <Button
              className="flex-[2]"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              {draft.length > 0
                ? `Voir les résultats (${draft.length})`
                : "Voir les résultats"}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

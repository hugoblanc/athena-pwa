"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import { GroupMultiSelect } from "./group-multi-select";
import { SelectField } from "./select-field";
import {
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  type LawFilterState,
} from "./filters";

/**
 * Feuille de filtres mobile (Dialog Base UI, ancrée en bas).
 * Édite un brouillon local, applique à la fermeture via « Voir les résultats ».
 */
export function LawFilterSheet({
  open,
  onOpenChange,
  state,
  onApply,
  onClear,
  activeCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: LawFilterState;
  onApply: (next: LawFilterState) => void;
  onClear: () => void;
  activeCount: number;
}) {
  const [draft, setDraft] = useState<LawFilterState>(state);

  // Resync le brouillon à chaque ouverture.
  function handleOpenChange(next: boolean) {
    if (next) setDraft(state);
    onOpenChange(next);
  }

  function toggleGroup(code: string) {
    setDraft((d) => ({
      ...d,
      groupe: d.groupe.includes(code)
        ? d.groupe.filter((c) => c !== code)
        : [...d.groupe, code],
    }));
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-200" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-lg)] border-t border-border bg-surface p-5 pb-8 shadow-elev-2 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full transition-transform duration-200 motion-reduce:transition-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-extrabold">
              Filtres
            </Dialog.Title>
            <Dialog.Close
              render={<IconButton aria-label="Fermer" />}
            >
              <X />
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            <section>
              <h3 className="mb-2 text-sm font-bold">Groupe politique</h3>
              <GroupMultiSelect selected={draft.groupe} onToggle={toggleGroup} />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-bold">Type</h3>
              <SelectField
                label="Type de proposition"
                value={draft.type}
                options={TYPE_OPTIONS}
                onChange={(type) => setDraft((d) => ({ ...d, type }))}
              />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-bold">Statut de simplification</h3>
              <SelectField
                label="Statut de simplification"
                value={draft.statut}
                options={STATUS_OPTIONS}
                onChange={(statut) => setDraft((d) => ({ ...d, statut }))}
              />
            </section>
          </div>

          <div className="mt-6 flex gap-2.5">
            {activeCount > 0 && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  onClear();
                  onOpenChange(false);
                }}
              >
                Effacer
              </Button>
            )}
            <Button
              className="flex-[2]"
              onClick={() => {
                onApply(draft);
                onOpenChange(false);
              }}
            >
              Voir les résultats
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

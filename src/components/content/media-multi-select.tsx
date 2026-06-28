"use client";

import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { ListMetaMedia } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { mediaLogoSrc } from "@/lib/media";

/**
 * Liste de médias groupés par catégorie avec cases à cocher.
 * Composant de sélection partagé (filtre du fil + générateur de flux RSS) pour
 * éviter deux UIs concurrentes sur le même besoin.
 */
export function MediaMultiSelect({
  groups,
  selected,
  onToggle,
  className,
}: {
  groups: ListMetaMedia[];
  selected: string[];
  onToggle: (key: string) => void;
  className?: string;
}) {
  const visibleGroups = groups.filter((g) => g.metaMedias?.length);

  return (
    <div className={cn("space-y-5", className)}>
      {visibleGroups.map((group) => (
        <section key={group.id}>
          <h3 className="mb-2 text-[13px] font-bold uppercase tracking-[0.06em] text-text-dim">
            {group.title}
          </h3>
          <div className="flex flex-col gap-1">
            {[...group.metaMedias]
              .sort((a, b) => a.title.localeCompare(b.title, "fr"))
              .map((media) => {
                const checked = selected.includes(media.key);
                return (
                  <button
                    key={media.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => onToggle(media.key)}
                    className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2 text-start transition-colors hover:bg-surface-2"
                  >
                    <Avatar
                      src={mediaLogoSrc(media.logo)}
                      name={media.title}
                      size={28}
                      square
                    />
                    <span className="flex-1 truncate text-[15px] font-medium text-text">
                      {media.title}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-[22px] shrink-0 place-items-center rounded-[7px] border transition-colors",
                        checked
                          ? "border-primary bg-primary text-on-primary"
                          : "border-border bg-surface-2",
                      )}
                    >
                      {checked && <Check className="size-[15px]" />}
                    </span>
                  </button>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}

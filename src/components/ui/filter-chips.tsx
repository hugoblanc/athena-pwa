"use client";

import { trackFeature } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export interface ChipOption {
  value: string;
  label: string;
}

/** Rangée de filtres à sélection unique, scrollable horizontalement (mobile). */
export function FilterChips({
  options,
  value,
  onChange,
  className,
}: {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => {
              if (opt.value !== value) trackFeature("filter");
              onChange(opt.value);
            }}
            className={cn(
              "shrink-0 rounded-full border border-transparent px-[15px] py-2 text-[13px] font-semibold whitespace-nowrap transition-colors",
              active
                ? "bg-primary text-on-primary"
                : "bg-surface-2 text-text-dim hover:text-text",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

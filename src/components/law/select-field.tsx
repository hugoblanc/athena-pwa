"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Petit `<select>` natif habillé DS (léger, a11y native, pas de dépendance). */
export function SelectField({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-9 w-full appearance-none rounded-[var(--radius)] border border-border bg-surface-2 pl-3.5 pr-9 text-[13px] font-semibold text-text transition-colors hover:border-text-faint"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-dim"
      />
    </label>
  );
}

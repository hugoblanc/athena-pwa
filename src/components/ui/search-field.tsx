"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Champ de recherche debouncé (input ≥ 16 px anti-zoom iOS).
 * `onSearch` est appelé après `delay` ms d'inactivité.
 */
export function SearchField({
  defaultValue = "",
  placeholder = "Rechercher…",
  onSearch,
  delay = 300,
  className,
}: {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (value: string) => void;
  delay?: number;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface-2 pl-10 pr-10 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]"
      />
      {value && (
        <button
          aria-label="Effacer"
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
        >
          <X className="size-[18px]" />
        </button>
      )}
    </div>
  );
}

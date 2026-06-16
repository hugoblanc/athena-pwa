"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

const inputClass =
  "h-11 w-full rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)] aria-[invalid=true]:border-danger";

/** Champ texte stylé DS (label + erreur, ≥ 16 px / ≥ 44 px). */
export function TextField({
  label,
  error,
  className,
  id,
  ...props
}: { label?: string; error?: string } & ComponentProps<"input">) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={fieldId} className="text-[13px] font-semibold">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        aria-invalid={!!error}
        className={inputClass}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

/** Champ mot de passe avec bascule de visibilité. */
export function PasswordField({
  label,
  error,
  className,
  id,
  ...props
}: { label?: string; error?: string } & ComponentProps<"input">) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={fieldId} className="text-[13px] font-semibold">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          className={cn(inputClass, "pr-11")}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Masquer" : "Afficher"}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-text"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface-2 text-text border border-border hover:border-text-faint",
  ghost: "bg-transparent text-text-dim hover:bg-surface-2 hover:text-text",
  danger:
    "bg-transparent text-danger border border-danger/35 hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  default: "h-[42px] px-[18px] text-sm",
  sm: "h-9 px-3.5 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ComponentProps<typeof BaseButton> & { variant?: Variant; size?: Size }) {
  return (
    <BaseButton
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-semibold whitespace-nowrap transition-[background,border-color,color] duration-150 disabled:opacity-45 disabled:cursor-not-allowed [&_svg]:size-[18px]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

/** Bouton icône carré (barres d'outils). */
export function IconButton({
  className,
  ...props
}: ComponentProps<typeof BaseButton>) {
  return (
    <BaseButton
      className={cn(
        "grid size-[42px] place-items-center rounded-[var(--radius)] border border-border bg-surface-2 text-text-dim transition-colors duration-150 hover:text-text hover:border-text-faint [&_svg]:size-5",
        className,
      )}
      {...props}
    />
  );
}

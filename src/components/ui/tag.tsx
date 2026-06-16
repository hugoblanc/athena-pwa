import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Badge type/source du contenu (ex. « VIDÉO · BLAST »). */
export function Tag({
  children,
  orange = false,
  className,
}: {
  children: ReactNode;
  orange?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.07em]",
        orange
          ? "bg-primary/15 text-tag-text-orange"
          : "bg-tag-bg text-tag-text",
        className,
      )}
    >
      {children}
    </span>
  );
}

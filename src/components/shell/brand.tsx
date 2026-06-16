import { cn } from "@/lib/cn";

/** Logo + nom Athena. */
export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[10px]", className)}>
      <div className="grid size-[34px] place-items-center rounded-[9px] bg-gradient-to-br from-brand-500 to-brand-600 font-display text-[17px] font-extrabold text-white shadow-[0_4px_12px_rgba(252,116,58,0.35)]">
        A
      </div>
      <span className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
        Athena
      </span>
    </div>
  );
}

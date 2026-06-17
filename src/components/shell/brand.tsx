import { cn } from "@/lib/cn";

/** Logo + nom Athena (chouette de marque + wordmark). */
export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[10px]", className)}>
      {/* Owl détouré (= favicon / icône d'app) + lueur orange douce. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/favicon.png"
        alt=""
        width={36}
        height={36}
        className="size-[36px] drop-shadow-[0_2px_10px_rgba(252,116,58,0.4)]"
      />
      <span className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
        Athena
      </span>
    </div>
  );
}

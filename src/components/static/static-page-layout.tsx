import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Wrapper éditorial partagé par `/informations` et `/privacy` (Server Component).
 * Colonne de lecture `max-w-[640px]`, titre `display`, et styles de prose
 * maison (via `.prose-athena`, cf. classe utilitaire ci-dessous) câblés sur
 * les tokens DS — pas de couleurs en dur.
 */
export function StaticPageLayout({
  title,
  intro,
  updatedAt,
  children,
  className,
}: {
  title: string;
  intro?: ReactNode;
  /** Date de dernière mise à jour (déjà formatée), affichée sous le titre. */
  updatedAt?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[640px] px-5 pt-4 pb-12 lg:px-8 lg:pt-8", className)}>
      <header className="mb-6">
        <h1 className="font-display text-[22px] font-extrabold tracking-[-0.02em] lg:text-[28px]">
          {title}
        </h1>
        {updatedAt && (
          <p className="mt-1.5 text-xs text-text-faint">
            Dernière mise à jour : {updatedAt}
          </p>
        )}
        {intro && <p className="mt-3 text-[15px] text-text-dim">{intro}</p>}
      </header>

      <div
        className={cn(
          // Prose maison — sélecteurs descendants stylés via tokens DS.
          "text-[15px] leading-relaxed text-text",
          "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[18px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.01em] [&_h2]:scroll-mt-24",
          "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-[15.5px] [&_h3]:font-bold",
          "[&_p]:my-3 [&_p]:text-text-dim",
          "[&_ul]:my-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:text-text-dim [&_li]:list-disc [&_li]:marker:text-text-faint",
          "[&_a]:font-medium [&_a]:text-tag-text-orange [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary",
          "[&_strong]:font-semibold [&_strong]:text-text",
        )}
      >
        {children}
      </div>
    </div>
  );
}

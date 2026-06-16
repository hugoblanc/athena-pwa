import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Podcast } from "@/lib/api/types";

interface NavTarget {
  id: number;
  title: string;
}

/** Liens prev/next contextualisés (titre), désactivés si absents. */
export function PodcastNav({
  previous,
  next,
}: {
  previous: Podcast | null;
  next: Podcast | null;
}) {
  const prev: NavTarget | null = previous
    ? { id: previous.id, title: previous.content?.title ?? "Podcast précédent" }
    : null;
  const nxt: NavTarget | null = next
    ? { id: next.id, title: next.content?.title ?? "Podcast suivant" }
    : null;

  if (!prev && !nxt) return null;

  return (
    <nav className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Navigation entre podcasts">
      <NavLink dir="prev" target={prev} />
      <NavLink dir="next" target={nxt} />
    </nav>
  );
}

function NavLink({
  dir,
  target,
}: {
  dir: "prev" | "next";
  target: NavTarget | null;
}) {
  const label = dir === "prev" ? "Précédent" : "Suivant";

  if (!target) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3.5 py-3 opacity-40",
          dir === "next" && "flex-row-reverse text-right",
        )}
      >
        {dir === "prev" ? (
          <ChevronLeft className="size-5 shrink-0 text-text-faint" />
        ) : (
          <ChevronRight className="size-5 shrink-0 text-text-faint" />
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-faint">
            {label}
          </div>
          <div className="truncate text-sm text-text-dim">—</div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/podcasts/${target.id}`}
      aria-label={`${dir === "prev" ? "Podcast précédent" : "Podcast suivant"} : ${target.title}`}
      className={cn(
        "group flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3.5 py-3 shadow-elev-1 transition-[border-color] hover:border-primary",
        dir === "next" && "flex-row-reverse text-right",
      )}
    >
      {dir === "prev" ? (
        <ChevronLeft className="size-5 shrink-0 text-text-dim group-hover:text-primary" />
      ) : (
        <ChevronRight className="size-5 shrink-0 text-text-dim group-hover:text-primary" />
      )}
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-faint">
          {label}
        </div>
        <div className="truncate font-display text-sm font-bold">
          {target.title}
        </div>
      </div>
    </Link>
  );
}

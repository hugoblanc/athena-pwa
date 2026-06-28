import { ThumbsUp } from "lucide-react";
import Link from "next/link";
import type { Issue } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { VoteButtons } from "./vote-buttons";

/** Statuts pour lesquels le vote n'a plus de sens (compteur figé). */
const NON_VOTABLE = new Set(["done", "rejected"]);

/**
 * Carte d'une demande (issue). Carte entièrement cliquable (→ détail +
 * commentaires) + bloc vote à droite.
 *
 * Toute la carte navigue via un lien overlay (`absolute inset-0`) ; on ne peut
 * pas étendre le lien du titre car `line-clamp` (display:-webkit-box) casse son
 * pseudo-élément. Le clap est un `<button>` distinct au-dessus de l'overlay
 * (`relative z-10`) — pas de bouton imbriqué dans un `<a>`.
 */
export function IssueCard({
  issue,
  className,
}: {
  issue: Issue;
  className?: string;
}) {
  const hasId = typeof issue.id === "number";
  // Score net : `voteCount` (claps − downvotes) si exposé, sinon les claps.
  const netVotes = issue.voteCount ?? issue.claps ?? 0;

  return (
    <article
      className={cn(
        "group relative flex items-start gap-3 rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-primary",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-[15px] font-bold leading-snug tracking-[-0.01em] line-clamp-2 transition-colors group-hover:text-primary">
          {issue.title}
        </h3>
        {issue.body && (
          <p className="mt-1.5 text-[13px] text-text-dim line-clamp-2">
            {issue.body}
          </p>
        )}
      </div>

      {/* `relative z-10` : reste cliquable au-dessus du lien overlay. */}
      {hasId &&
        (NON_VOTABLE.has(issue.status ?? "open") ? (
          <span
            className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-text-faint"
            aria-label={`${netVotes} vote${netVotes > 1 ? "s" : ""}`}
          >
            <ThumbsUp className="size-[15px]" aria-hidden />
            {netVotes}
          </span>
        ) : (
          <div className="relative z-10">
            <VoteButtons
              issueId={issue.id as number}
              count={netVotes}
              title={issue.title}
            />
          </div>
        ))}

      {/* Lien overlay : toute la carte cliquable, sous le bloc vote (z-10). */}
      {hasId && (
        <Link
          href={`/roadmap/${issue.id}`}
          aria-label={issue.title}
          className="absolute inset-0 z-[1] rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      )}
    </article>
  );
}

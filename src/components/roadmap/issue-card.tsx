import { ThumbsUp } from "lucide-react";
import type { Issue } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { ClapButton } from "./clap-button";

/** Statuts pour lesquels le vote n'a plus de sens (compteur figé). */
const NON_VOTABLE = new Set(["done", "rejected"]);

/**
 * Carte d'une demande (issue). Titre + extrait + bloc vote à droite.
 *
 * Le vote est interactif tant que l'idée est ouverte ; sur une idée livrée ou
 * écartée, on affiche le compteur figé (non cliquable).
 *
 * a11y : le clap est un `<button>` distinct, hors de tout lien englobant
 * (pas de bouton dans un `<a>`). Le lien GitHub n'est posé que si `htmlUrl`
 * est exposé par le futur contrat.
 */
export function IssueCard({
  issue,
  htmlUrl,
  className,
}: {
  issue: Issue;
  htmlUrl?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex items-start gap-3 rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-primary",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {htmlUrl ? (
          <a
            href={htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-[15px] font-bold leading-snug tracking-[-0.01em] line-clamp-2 outline-none hover:text-primary focus-visible:text-primary"
          >
            {issue.title}
          </a>
        ) : (
          <h3 className="font-display text-[15px] font-bold leading-snug tracking-[-0.01em] line-clamp-2">
            {issue.title}
          </h3>
        )}
        {issue.body && (
          <p className="mt-1.5 text-[13px] text-text-dim line-clamp-2">
            {issue.body}
          </p>
        )}
      </div>

      {typeof issue.id === "number" &&
        (NON_VOTABLE.has(issue.status ?? "open") ? (
          <span
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px] font-semibold text-text-faint"
            aria-label={`${issue.claps ?? 0} vote${(issue.claps ?? 0) > 1 ? "s" : ""}`}
          >
            <ThumbsUp className="size-[15px]" aria-hidden />
            {issue.claps ?? 0}
          </span>
        ) : (
          <ClapButton
            issueId={issue.id}
            count={issue.claps ?? 0}
            title={issue.title}
          />
        ))}
    </article>
  );
}

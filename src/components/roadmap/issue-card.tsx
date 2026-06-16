import type { Issue } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { ClapButton } from "./clap-button";

/**
 * Carte d'une demande (issue). Titre + extrait + bloc clap à droite.
 *
 * ⚠️ Non monté en v1 : il n'existe pas de `GET /issues` propre pour alimenter
 * une liste (cf. roadmap.ts / spec §10). Composant prêt pour la v2.
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

      {typeof issue.id === "number" && (
        <ClapButton
          issueId={issue.id}
          count={issue.claps ?? 0}
          title={issue.title}
        />
      )}
    </article>
  );
}

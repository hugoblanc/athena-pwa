import { ExternalLink } from "lucide-react";
import { ATHENA_REPO_URL } from "@/lib/api/roadmap";

/** Encart pédagogique en tête de la roadmap (open-source + lien dépôt). */
export function RoadmapIntro() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1">
      <p className="text-sm leading-relaxed text-text-dim">
        Athena est un projet{" "}
        <span className="font-semibold text-text">open-source</span>. Cette page
        rassemble ce qui est en construction. Proposez une amélioration ou un
        correctif&nbsp;: la communauté pourra voter pour orienter les priorités.
      </p>
      <a
        href={ATHENA_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary outline-none hover:underline focus-visible:underline"
      >
        Voir le dépôt sur GitHub
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </div>
  );
}

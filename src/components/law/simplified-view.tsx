import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SimplifiedVersion } from "@/lib/api/types";

/**
 * Vue « Simplifié » : points clés + exposé des motifs + résumés d'articles.
 * Server Component. Gère les sous-sections vides (pas de titre orphelin) et
 * l'état « résumé indisponible ».
 */
export function SimplifiedView({
  simplified,
  onSwitchToOfficial,
}: {
  simplified?: SimplifiedVersion;
  /** id de l'onglet officiel (pour le CTA de repli). */
  onSwitchToOfficial?: string;
}) {
  if (!simplified || simplified.status !== "completed") {
    const message =
      simplified?.status === "pending"
        ? "Le résumé IA est en cours de préparation pour cette proposition."
        : simplified?.status === "failed"
          ? "Le résumé IA n'a pas pu être généré pour cette proposition."
          : "Le résumé IA n'est pas encore disponible pour cette proposition.";
    return (
      <div className="rounded-[var(--radius)] border border-border bg-surface p-5 text-center">
        <p className="text-sm text-text-dim">{message}</p>
        {onSwitchToOfficial && (
          <p className="mt-3 text-sm text-text-dim">
            Consultez la version officielle pour le texte intégral.
          </p>
        )}
      </div>
    );
  }

  const keyPoints = simplified.keyPoints ?? [];
  const motifs = simplified.exposeMotifs ?? [];
  const articles = simplified.articles ?? [];

  return (
    <div className="space-y-7">
      {keyPoints.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-[17px] font-extrabold tracking-[-0.01em]">
            Points clés
          </h2>
          <ul className="space-y-2.5">
            {keyPoints.map((kp, i) => (
              <li key={i} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span className="text-[15px] leading-relaxed">{kp}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {motifs.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-[17px] font-extrabold tracking-[-0.01em]">
            Exposé des motifs
          </h2>
          <div className="space-y-4">
            {[...motifs]
              .sort((a, b) => a.ordre - b.ordre)
              .map((m, i) => (
                <div key={i}>
                  {m.titre && (
                    <h3 className="mb-1 font-display text-[15px] font-bold">
                      {m.titre}
                    </h3>
                  )}
                  <p className="text-[15px] leading-relaxed text-text-dim">
                    {m.texte}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-[17px] font-extrabold tracking-[-0.01em]">
            Articles
          </h2>
          <div className="space-y-3">
            {[...articles]
              .sort((a, b) => a.ordre - b.ordre)
              .map((a, i) => (
                <article
                  key={i}
                  id={`article-${a.numero}`}
                  className="rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1"
                >
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-tag-text-orange">
                    <FileText className="size-3.5" aria-hidden />
                    Article {a.numero}
                  </div>
                  <p className="text-[15px] leading-relaxed">{a.resume}</p>
                </article>
              ))}
          </div>
        </section>
      )}

      {keyPoints.length === 0 &&
        motifs.length === 0 &&
        articles.length === 0 && (
          <div className="rounded-[var(--radius)] border border-border bg-surface p-5 text-center text-sm text-text-dim">
            Le résumé est marqué comme disponible mais ne contient aucun
            élément.
            {onSwitchToOfficial && (
              <Button variant="secondary" className="mt-3 w-full">
                Lire la version officielle
              </Button>
            )}
          </div>
        )}
    </div>
  );
}

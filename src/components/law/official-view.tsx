import { DocumentLinks } from "@/components/law/document-links";
import { sanitizeHtml } from "@/lib/sanitize";
import type { LawProposal } from "@/lib/api/types";

/**
 * Vue « Officiel » : description (texte intégral du dépôt, possiblement HTML)
 * + exposé des motifs si présent + accès aux documents officiels.
 * Server Component (sanitize côté serveur avant dangerouslySetInnerHTML).
 *
 * Note : le type `LawProposal` committé ne porte pas `sections`/`amendements`
 * → l'officiel s'appuie sur `description` + `exposeMotifs` + PDF (cf. spec §3).
 */
export function OfficialView({ proposal }: { proposal: LawProposal }) {
  const description = proposal.description?.trim();
  const motifs = proposal.simplified?.exposeMotifs ?? [];

  return (
    <div className="space-y-7">
      {description ? (
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
        />
      ) : (
        <p className="text-sm text-text-dim">
          Le texte intégral n&apos;est pas disponible ici. Consultez le document
          officiel ci-dessous.
        </p>
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

      <DocumentLinks
        urlDocument={proposal.urlDocument}
        urlDossierLegislatif={proposal.urlDossierLegislatif}
      />
    </div>
  );
}

import { ExternalLink, FileText } from "lucide-react";

/**
 * Liens vers les documents officiels (PDF + dossier législatif).
 * Server Component. N'affiche que les liens présents.
 */
export function DocumentLinks({
  urlDocument,
  urlDossierLegislatif,
}: {
  urlDocument?: string | null;
  urlDossierLegislatif?: string | null;
}) {
  if (!urlDocument && !urlDossierLegislatif) return null;

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row">
      {urlDocument && (
        <a
          href={urlDocument}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-[18px] py-2.5 text-sm font-semibold text-text transition-colors hover:border-text-faint"
        >
          <FileText className="size-[18px]" aria-hidden />
          Texte officiel (PDF)
        </a>
      )}
      {urlDossierLegislatif && (
        <a
          href={urlDossierLegislatif}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-[18px] py-2.5 text-sm font-semibold text-text transition-colors hover:border-text-faint"
        >
          <ExternalLink className="size-[18px]" aria-hidden />
          Dossier législatif
        </a>
      )}
    </div>
  );
}

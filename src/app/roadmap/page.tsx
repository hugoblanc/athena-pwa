import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { NewIssueDialog } from "@/components/roadmap/new-issue-dialog";
import { RoadmapFilter } from "@/components/roadmap/roadmap-filter";
import { RoadmapIntro } from "@/components/roadmap/roadmap-intro";
import { RoadmapList } from "@/components/roadmap/roadmap-list";
import {
  DEFAULT_TYPE,
  TYPE_COPY,
  TYPE_FILTERS,
  VALID_TYPE,
} from "@/components/roadmap/roadmap-meta";
import { RoadmapTypeFilter } from "@/components/roadmap/roadmap-type-filter";
import { STATUS_FILTERS } from "@/components/roadmap/status-badge";
import { Button } from "@/components/ui/button";
import { listIssues } from "@/lib/api/roadmap";
import type { Issue } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Ce qui est en construction sur Athena. Proposez une amélioration et votez pour orienter les priorités.",
};

/** Valeurs de statut acceptées dans l'URL (`?statut=`). */
const VALID_STATUS = new Set(
  STATUS_FILTERS.map((f) => f.value).filter(Boolean),
);

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; type?: string }>;
}) {
  const { statut: rawStatut, type: rawType } = await searchParams;
  // Deux dimensions dans l'URL : `type` (Idées/Médias/Bugs, défaut feature) et
  // `statut` (filtre secondaire au sein du type).
  const type = rawType && VALID_TYPE.has(rawType) ? rawType : DEFAULT_TYPE;
  const statut = rawStatut && VALID_STATUS.has(rawStatut) ? rawStatut : "";

  // Liste des idées votées (BDD via API Athena). En cas d'échec API : EmptyState d'erreur.
  let allIssues: Issue[] = [];
  let error = false;
  try {
    allIssues = await listIssues();
  } catch {
    error = true;
  }

  // Compteurs par type pour les chips principales.
  const typeCounts: Record<string, number> = {};
  for (const i of allIssues) {
    const t = i.type ?? DEFAULT_TYPE;
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }

  // Sous-ensemble du type actif, puis compteurs par statut sur ce sous-ensemble.
  const typed = allIssues.filter((i) => (i.type ?? DEFAULT_TYPE) === type);
  const statusCounts: Record<string, number> = { __all: typed.length };
  for (const i of typed) {
    const s = i.status ?? "open";
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  }

  // Statut filtré → liste à plat ; sinon vue groupée (rejected masqué).
  const issues = statut
    ? typed.filter((i) => (i.status ?? "open") === statut)
    : typed;

  const copy = TYPE_COPY[type] ?? TYPE_COPY[DEFAULT_TYPE];

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-24 pt-4 lg:pb-10 lg:pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-extrabold tracking-[-0.02em]">
            Roadmap
          </h1>
          <p className="mt-0.5 text-sm text-text-dim">En construction</p>
        </div>
        {/* Desktop : bouton inline dans l'en-tête. */}
        <div className="hidden lg:block">
          <NewIssueDialog
            type={type}
            trigger={
              <Button variant="primary">
                <Plus aria-hidden />
                {copy.cta}
              </Button>
            }
          />
        </div>
      </div>

      <RoadmapIntro />

      {!error && allIssues.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {/* Dimension principale : type (Idées / Médias / Bugs). */}
          <RoadmapTypeFilter value={type} counts={typeCounts} />
          {/* Dimension secondaire : statut, au sein du type. */}
          {typed.length > 0 && (
            <RoadmapFilter value={statut} type={type} counts={statusCounts} />
          )}
        </div>
      )}

      <div className="mt-5">
        <RoadmapList
          issues={issues}
          error={error}
          grouped={!statut}
          emptyTitle={copy.emptyTitle}
          emptyDescription={copy.emptyDescription}
          emptyAction={
            <NewIssueDialog
              type={type}
              trigger={
                <Button variant="primary">
                  <Plus aria-hidden />
                  {copy.cta}
                </Button>
              }
            />
          }
        />
      </div>

      {/* Mobile : FAB flottant (décalé au-dessus de la tab bar + player). */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-5 z-30 lg:hidden">
        <NewIssueDialog
          type={type}
          trigger={
            <Button
              variant="primary"
              aria-label={copy.cta}
              className="size-14 rounded-full p-0 shadow-elev-1 [&_svg]:size-6"
            >
              <Plus aria-hidden />
            </Button>
          }
        />
      </div>
    </div>
  );
}

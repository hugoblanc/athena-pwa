import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { NewIssueDialog } from "@/components/roadmap/new-issue-dialog";
import { RoadmapFilter } from "@/components/roadmap/roadmap-filter";
import { RoadmapIntro } from "@/components/roadmap/roadmap-intro";
import { RoadmapList } from "@/components/roadmap/roadmap-list";
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
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut: rawStatut } = await searchParams;
  const statut = rawStatut && VALID_STATUS.has(rawStatut) ? rawStatut : "";

  // Liste des idées votées (BDD via API Athena). En cas d'échec API : EmptyState d'erreur.
  let allIssues: Issue[] = [];
  let error = false;
  try {
    allIssues = await listIssues();
  } catch {
    error = true;
  }

  // Compteurs par statut pour les chips (+ total tous statuts confondus).
  const counts: Record<string, number> = { __all: allIssues.length };
  for (const i of allIssues) {
    const s = i.status ?? "open";
    counts[s] = (counts[s] ?? 0) + 1;
  }

  // Filtre actif → liste à plat de ce statut ; sinon vue groupée (rejected masqué).
  const issues = statut
    ? allIssues.filter((i) => (i.status ?? "open") === statut)
    : allIssues;

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
            trigger={
              <Button variant="primary">
                <Plus aria-hidden />
                Proposer une amélioration
              </Button>
            }
          />
        </div>
      </div>

      <RoadmapIntro />

      {!error && allIssues.length > 0 && (
        <div className="mt-5">
          <RoadmapFilter value={statut} counts={counts} />
        </div>
      )}

      <div className="mt-5">
        <RoadmapList
          issues={issues}
          error={error}
          grouped={!statut}
          emptyAction={
            <NewIssueDialog
              trigger={
                <Button variant="primary">
                  <Plus aria-hidden />
                  Proposer une amélioration
                </Button>
              }
            />
          }
        />
      </div>

      {/* Mobile : FAB flottant (décalé au-dessus de la tab bar + player). */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-5 z-30 lg:hidden">
        <NewIssueDialog
          trigger={
            <Button
              variant="primary"
              aria-label="Proposer une amélioration"
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

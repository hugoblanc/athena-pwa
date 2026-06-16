import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { NewIssueDialog } from "@/components/roadmap/new-issue-dialog";
import { RoadmapIntro } from "@/components/roadmap/roadmap-intro";
import { RoadmapList } from "@/components/roadmap/roadmap-list";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "Ce qui est en construction sur Athena. Proposez une amélioration et votez pour orienter les priorités.",
};

export default function RoadmapPage() {
  // v1 MINIMALE : pas de `GET /issues` propre côté API (cf. spec §10 / roadmap.ts).
  // → liste vide : on rend l'EmptyState explicatif + action « Proposer ».
  const issues = [] as const;

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

      <div className="mt-5">
        <RoadmapList
          issues={[...issues]}
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

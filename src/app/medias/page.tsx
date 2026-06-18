import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import { MediaCard } from "@/components/content/media-card";
import { SectionHeader } from "@/components/content/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getMetaMedias } from "@/lib/api/meta-media";

/**
 * Annuaire des médias libres (`/medias`).
 * Server Component public → SSR/ISR pour le SEO. L'annuaire bouge rarement
 * (ajout d'un média = événement éditorial) donc revalidation longue (1 h).
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Médias",
  description:
    "Annuaire des médias libres agrégés par Athena, groupés par catégorie.",
};

export default async function MediasPage() {
  const groups = await getMetaMedias();

  const hasMedia = groups.some((g) => g.metaMedias?.length);

  return (
    <div className="mx-auto max-w-5xl px-5 pt-4 lg:pt-6">
      <h1 className="mb-4 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        Médias
      </h1>

      {!hasMedia ? (
        <EmptyState
          icon={LayoutGrid}
          title="Aucun média disponible"
          description="L'annuaire des médias libres n'est pas encore renseigné. Revenez bientôt."
        />
      ) : (
        <div className="flex flex-col gap-6 pb-8">
          {groups
            .filter((g) => g.metaMedias?.length)
            .map((group) => (
              <section key={group.id}>
                <SectionHeader title={group.title} sticky />
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {[...group.metaMedias]
                    .sort((a, b) => a.title.localeCompare(b.title, "fr"))
                    .map((media) => (
                      <MediaCard key={media.key} media={media} />
                    ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

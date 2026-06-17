import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { CoSignataires } from "@/components/law/co-signataires";
import { DeputeChip } from "@/components/law/depute-chip";
import { LawProposalHeader } from "@/components/law/proposal-header";
import { OfficialView } from "@/components/law/official-view";
import { SimplifiedView } from "@/components/law/simplified-view";
import { getLawProposal } from "@/lib/api/law-proposal";
import { ApiError } from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/config";
import type { LawProposal } from "@/lib/api/types";
import { absoluteUrl, buildShareUrl, sharePath } from "@/lib/site";

async function fetchProposal(numero: string): Promise<LawProposal> {
  try {
    return await getLawProposal(numero);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ numero: string }>;
}): Promise<Metadata> {
  const { numero } = await params;
  try {
    const p = await getLawProposal(numero);
    const description =
      p.simplified?.keyPoints?.[0] ?? p.description ?? undefined;
    // URL canonique = alias court /loi (consolide le SEO entre /loi et /propositions).
    const canonical = absoluteUrl(sharePath.law(p.numero));
    // Image OG générée et servie par l'API (cache volume).
    const ogImage = `${API_BASE_URL}/law-proposal/${encodeURIComponent(
      String(p.numero),
    )}/og.png`;
    return {
      title: `${p.titre} — Proposition n°${p.numero}`,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        title: p.titre,
        description,
        siteName: "Athena",
        url: canonical,
        images: [{ url: ogImage, width: 1200, height: 630, alt: p.titre }],
      },
      twitter: {
        card: "summary_large_image",
        title: p.titre,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: "Proposition de loi — Athena" };
  }
}

export default async function PropositionDetailPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const proposal = await fetchProposal(numero);

  const simplifiedReady = proposal.simplified?.status === "completed";
  const defaultTab = simplifiedReady ? "simplifie" : "officiel";

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 pb-10 lg:pt-6">
      <LawProposalHeader
        proposal={proposal}
        shareUrl={buildShareUrl(sharePath.law(proposal.numero))}
        shareRefId={String(proposal.numero)}
      />

      {/* auteur */}
      <section className="mt-5" aria-label="Auteur">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-text-dim">
          Auteur
        </h2>
        <DeputeChip depute={proposal.auteur} size={44} />
      </section>

      {/* onglets */}
      <div className="mt-6">
        <Tabs
          defaultValue={defaultTab}
          items={[
            {
              value: "simplifie",
              label: "Version simplifiée",
              panel: (
                <SimplifiedView
                  simplified={proposal.simplified}
                  onSwitchToOfficial="officiel"
                />
              ),
            },
            {
              value: "officiel",
              label: "Version officielle",
              panel: <OfficialView proposal={proposal} />,
            },
          ]}
        />
      </div>

      {/* co-signataires */}
      {proposal.coSignataires?.length > 0 && (
        <div className="mt-9">
          <CoSignataires deputes={proposal.coSignataires} />
        </div>
      )}
    </div>
  );
}

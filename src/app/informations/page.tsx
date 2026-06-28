import type { Metadata } from "next";
import { ExternalLink, Map } from "lucide-react";
import Link from "next/link";
import { OnboardingOverlay } from "@/components/onboarding/onboarding-overlay";
import { ReplayTutorialButton } from "@/components/static/replay-tutorial-button";
import { StaticPageLayout } from "@/components/static/static-page-layout";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const REPO_URL = "https://github.com/hugoblanc/Athena";

const linkChipClass =
  "inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text no-underline transition-colors hover:border-text-faint [&_svg]:size-[18px]";

export const metadata: Metadata = {
  title: "Informations",
  description:
    "À propos d'Athena : l'agrégateur open-source des médias libres. Projet, roadmap et code source.",
};

export default function InformationsPage() {
  return (
    <>
      <StaticPageLayout
        title="À propos d'Athena"
        intro="Athena réunit l'actualité des médias indépendants français en un seul fil : articles, vidéos, podcasts, propositions de loi et questions à l'IA."
      >
        <h2>Notre mission</h2>
        <p>
          Athena est une plateforme <strong>libre et open-source</strong> qui
          agrège et notifie les contenus des médias indépendants
          (« médias libres »). L&apos;objectif : faciliter l&apos;accès à une
          information plurielle, sans algorithme opaque ni mur payant.
        </p>

        <h2>Ce que vous pouvez faire</h2>
        <ul>
          <li>
            Suivre un <strong>fil d&apos;actualité agrégé</strong> de plusieurs
            médias indépendants.
          </li>
          <li>
            <strong>Écouter</strong> chaque article en audio (synthèse vocale).
          </li>
          <li>
            Recevoir des <strong>notifications</strong> des nouvelles
            publications.
          </li>
          <li>
            Suivre les <strong>propositions de loi</strong> et poser des
            questions à l&apos;IA sur l&apos;actualité.
          </li>
        </ul>

        <h2>Un projet ouvert</h2>
        <p>
          Le code d&apos;Athena est public et contributif. Consultez la
          roadmap, proposez des idées ou contribuez sur le dépôt.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <Link href="/roadmap" className={linkChipClass}>
            <Map />
            Roadmap
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkChipClass}
          >
            <ExternalLink />
            Code source
          </a>
          <ReplayTutorialButton />
        </div>

        <h2>Nous contacter</h2>
        <p>
          Une question, un bug ou une demande d&apos;ajout de média ? Voir la
          page <Link href="/contact">contact</Link>.
        </p>

        <h2>Confidentialité</h2>
        <p>
          Consultez notre{" "}
          <Link href="/privacy">politique de confidentialité</Link> pour savoir
          quelles données sont traitées et pourquoi.
        </p>

        <p className="text-text-faint">Version {APP_VERSION}</p>
      </StaticPageLayout>

      {/* Monté ici pour permettre « Revoir le tutoriel ». */}
      <OnboardingOverlay />
    </>
  );
}

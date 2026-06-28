import type { Metadata } from "next";
import { ExternalLink, Mail } from "lucide-react";
import { StaticPageLayout } from "@/components/static/static-page-layout";

const CONTACT_EMAIL = "hugoblanc.blend@gmail.com";
const REPO_ISSUES_URL = "https://github.com/hugoblanc/Athena/issues";

const linkChipClass =
  "inline-flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[13px] font-semibold text-text no-underline transition-colors hover:border-text-faint [&_svg]:size-[18px]";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter l'équipe d'Athena : e-mail et dépôt public pour signaler un problème, poser une question ou proposer un média.",
};

export default function ContactPage() {
  return (
    <StaticPageLayout
      title="Contact"
      intro="Une question, un problème, une demande d'ajout de média ou un signalement éditorial ? Voici comment nous joindre."
    >
      <h2>Par e-mail</h2>
      <p>
        Écrivez-nous directement, nous répondons dès que possible :{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Sur le dépôt public</h2>
      <p>
        Athena est <strong>open-source</strong>. Vous pouvez signaler un bug,
        proposer un média ou suivre l&apos;avancement directement sur le dépôt
        GitHub.
      </p>

      <div className="mt-4 flex flex-wrap gap-2.5">
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkChipClass}>
          <Mail />
          {CONTACT_EMAIL}
        </a>
        <a
          href={REPO_ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkChipClass}
        >
          <ExternalLink />
          Signaler sur GitHub
        </a>
      </div>

      <h2>Éditeur</h2>
      <p>
        Athena est édité par Hugo Blanc. Pour toute question relative aux
        contenus agrégés ou à la confidentialité, l&apos;e-mail ci-dessus est le
        point de contact de référence.
      </p>
    </StaticPageLayout>
  );
}

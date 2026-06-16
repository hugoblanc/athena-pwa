import type { Metadata } from "next";
import Link from "next/link";
import { StaticPageLayout } from "@/components/static/static-page-layout";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité d'Athena : données collectées, finalités, conservation et vos droits.",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Politique de confidentialité"
      updatedAt="16 juin 2026"
      intro="Athena est conçu pour fonctionner sans compte. Cette page explique les données traitées lorsque vous utilisez l'application."
    >
      <h2 id="lecture-sans-compte">Lecture sans compte</h2>
      <p>
        La consultation des contenus (articles, vidéos, podcasts, propositions
        de loi) est <strong>libre et ne nécessite aucun compte</strong>. Aucune
        donnée personnelle n&apos;est requise pour lire.
      </p>

      <h2 id="compte">Compte (optionnel)</h2>
      <p>
        Un compte n&apos;est utile que pour deux fonctionnalités : recevoir des{" "}
        <strong>notifications</strong> et conserver l&apos;
        <strong>historique de vos questions à l&apos;IA</strong>. La création de
        compte s&apos;appuie sur l&apos;authentification Firebase (Google ou
        e-mail/mot de passe). Nous ne stockons alors que votre identifiant, votre
        e-mail et, le cas échéant, votre nom d&apos;affichage.
      </p>

      <h2 id="notifications">Notifications push</h2>
      <p>
        Si vous activez les notifications, un{" "}
        <strong>jeton d&apos;appareil</strong> est enregistré pour vous envoyer
        des alertes. Vous pouvez les désactiver à tout moment depuis les réglages
        de l&apos;application ou de votre appareil.
      </p>

      <h2 id="donnees-techniques">Données techniques</h2>
      <ul>
        <li>
          Un indicateur local (premier lancement, préférences d&apos;affichage)
          est stocké sur votre appareil et n&apos;est pas transmis.
        </li>
        <li>
          Aucune revente de données. Aucun traçage publicitaire tiers.
        </li>
      </ul>

      <h2 id="mesure-audience">Mesure d&apos;audience (anonyme et agrégée)</h2>
      <p>
        Pour comprendre comment les contenus partagés circulent, Athena compte
        des événements <strong>agrégés et anonymes</strong> : nombre de pages de
        partage vues et nombre de re-partages, par contenu et par jour.{" "}
        <strong>
          Aucun identifiant personnel, aucun profil et aucun cookie publicitaire
        </strong>{" "}
        ne sont créés. Votre adresse IP n&apos;est jamais stockée : elle sert
        uniquement, le temps d&apos;une requête, à calculer une empreinte
        quotidienne non réversible qui évite de compter deux fois la même visite,
        puis elle est oubliée. Nous ne conservons que des compteurs (des
        nombres), jamais de trace individuelle. Si votre navigateur envoie le
        signal <em>« Do Not Track »</em>, cette mesure est désactivée.
      </p>

      <h2 id="conservation">Conservation</h2>
      <p>
        Les données de compte sont conservées tant que le compte existe. Vous
        pouvez demander leur suppression en supprimant votre compte ou en nous
        contactant.
      </p>

      <h2 id="vos-droits">Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
        rectification et de suppression de vos données. Pour exercer ces droits,
        contactez l&apos;équipe via le{" "}
        <a
          href="https://github.com/hugoblanc/Athena/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          dépôt GitHub du projet
        </a>
        .
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Pour toute question relative à cette politique, consultez les{" "}
        <Link href="/informations">informations sur le projet</Link>.
      </p>
    </StaticPageLayout>
  );
}

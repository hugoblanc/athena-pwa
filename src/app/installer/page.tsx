import type { Metadata } from "next";
import { InstallGuidePageContent } from "@/components/static/install-guide-page";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Installer Athena — guide pas à pas",
  description:
    "Ajoutez Athena à votre écran d'accueil en moins d'une minute. Guide adapté à votre appareil (iPhone, Android, ordinateur).",
  alternates: { canonical: absoluteUrl("/installer") },
  openGraph: {
    type: "website",
    title: "Installer Athena sur votre téléphone",
    description:
      "L'app des médias libres, sur votre écran d'accueil. Sans store, gratuit, sans pub. Guide pas à pas adapté à votre appareil.",
    siteName: "Athena",
    url: absoluteUrl("/installer"),
  },
};

export default function InstallerPage() {
  return <InstallGuidePageContent />;
}

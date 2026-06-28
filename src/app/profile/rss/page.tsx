import type { Metadata } from "next";
import { RssFeedBuilder } from "@/components/content/rss-feed-builder";
import { getMetaMedias } from "@/lib/api/meta-media";
import type { ListMetaMedia } from "@/lib/api/types";

export const metadata: Metadata = {
  title: "Mon flux RSS",
  description:
    "Composez un flux RSS personnalisé à partir des médias libres agrégés par Athena.",
};

/**
 * Générateur de flux RSS (`/profile/rss`). Server Component : fetch SSR/ISR de
 * l'annuaire des médias, puis délégation au builder client (sélection + copie).
 */
export const revalidate = 3600;

export default async function RssFeedPage() {
  let groups: ListMetaMedia[] = [];
  try {
    groups = await getMetaMedias();
  } catch {
    // Annuaire indisponible : le builder s'affiche sans médias (URL « tous »).
  }

  return <RssFeedBuilder groups={groups} />;
}

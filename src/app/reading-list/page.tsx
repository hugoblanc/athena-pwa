import type { Metadata } from "next";
import { ReadingListClient } from "@/components/reading-list/reading-list-client";

export const metadata: Metadata = {
  title: "Liste de lecture",
  description: "Vos articles enregistrés à lire plus tard.",
};

export default function ReadingListPage() {
  return <ReadingListClient />;
}

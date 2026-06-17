import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Athena — Médias libres",
    short_name: "Athena",
    description:
      "Suivez l'actualité des médias indépendants : articles, vidéos, podcasts, propositions de loi et questions à l'IA.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "fr",
    // Auto-référence webapp : permet à `getInstalledRelatedApps()` (Chrome
    // Android) de détecter que CETTE PWA est déjà installée → on évite alors de
    // pousser l'install à quelqu'un qui l'a déjà. `prefer_related_applications`
    // reste false (on ne redirige pas vers une app native).
    related_applications: [
      { platform: "webapp", url: `${SITE_URL}/manifest.webmanifest` },
    ],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

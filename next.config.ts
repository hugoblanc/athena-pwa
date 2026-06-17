import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'accès au dev server via tunnel (ngrok) pour tester sur mobile.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app"],
  // Build autonome pour le déploiement Docker/CapRover.
  output: "standalone",
  // Images distantes (logos médias, miniatures de contenu).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Alias court et partageable des propositions de loi. `/loi/1234` sert la même
  // page que `/propositions/1234` sans redirection visible (l'URL /loi reste
  // affichée). La canonical pointe sur /loi (cf. generateMetadata) pour éviter
  // tout contenu dupliqué côté SEO.
  async rewrites() {
    return [
      { source: "/loi/:numero", destination: "/propositions/:numero" },
    ];
  },
};

export default nextConfig;

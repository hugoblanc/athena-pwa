import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Autorise l'accès au dev server via tunnel (ngrok) pour tester sur mobile.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app"],
  // Build autonome pour le déploiement Docker/CapRover.
  output: "standalone",
  // PostHog (reverse-proxy /ingest) : ne pas ajouter de slash final, sinon le
  // POST des events est cassé par une redirection.
  skipTrailingSlashRedirect: true,
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
      // Reverse-proxy PostHog (Cloud EU) servi depuis notre domaine : le client
      // appelle athena-app.xyz/ingest, on relaie côté serveur. Contourne les
      // ad-blockers ET le blocage *.posthog.com par le filternet iranien.
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);

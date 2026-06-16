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
};

export default nextConfig;

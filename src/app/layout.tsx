import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/app-shell";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";
import { SITE_ORIGIN } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Résout les URLs OG/canonical relatives en absolu (sinon cartes de partage cassées).
  metadataBase: SITE_ORIGIN,
  title: {
    default: "Athena — Médias libres",
    template: "%s · Athena",
  },
  description:
    "Suivez et recevez l'actualité des médias indépendants. Articles, vidéos, podcasts, propositions de loi et questions à l'IA.",
  applicationName: "Athena",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Athena",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#fafafb" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

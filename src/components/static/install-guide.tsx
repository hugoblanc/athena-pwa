"use client";

import {
  Check,
  CheckCircle2,
  Download,
  MoreVertical,
  Share,
  SquarePlus,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isInAppBrowser, isIOS, isStandalone } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (isIOS()) return "ios";
  if (typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)) {
    return "android";
  }
  return "desktop";
}

/** Une étape numérotée du guide. */
function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[12px] font-bold text-primary">
        {n}
      </span>
      <span className="flex-1 pt-0.5 text-[14px] leading-snug text-text-dim">
        {children}
      </span>
      {icon && <span className="shrink-0 pt-0.5 text-text">{icon}</span>}
    </li>
  );
}

/**
 * Guide d'installation PWA **adaptatif** : détecte iOS / Android / ordinateur et
 * affiche les bonnes étapes. Sur Android/Chrome, propose l'installation en un
 * tap (`beforeinstallprompt`). Détecte aussi les navigateurs in-app (où
 * l'installation est impossible) et invite à ouvrir dans le vrai navigateur.
 */
export function InstallGuide() {
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>("android");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [standalone, setStandalone] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPlatform(detectPlatform());
    setStandalone(isStandalone());
    setInApp(isInAppBrowser());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Évite tout flash d'un mauvais état avant l'hydratation.
  if (!mounted) return <div className="h-px" />;

  if (standalone || installed) {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius)] border border-primary/30 bg-primary/10 p-4">
        <CheckCircle2 className="size-6 shrink-0 text-primary" />
        <p className="text-[14.5px] font-medium text-text">
          Athena est installé sur cet appareil. Vous pouvez le lancer depuis
          votre écran d&apos;accueil.
        </p>
      </div>
    );
  }

  if (inApp) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
        <p className="text-[14.5px] font-bold text-text">
          Ouvrez d&apos;abord cette page dans votre navigateur
        </p>
        <p className="mt-1.5 text-[13.5px] leading-snug text-text-dim">
          Vous êtes dans le navigateur intégré d&apos;une autre app, qui ne
          permet pas l&apos;installation. Touchez le menu (souvent{" "}
          <MoreVertical className="inline size-4 align-text-bottom" /> en haut à
          droite) puis « Ouvrir dans Chrome » ou « Ouvrir dans Safari », et
          revenez ici.
        </p>
      </div>
    );
  }

  const canPrompt = platform !== "ios" && deferred;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
      {/* Sélecteur d'appareil (auto-détecté, ajustable) */}
      <div className="mb-4 inline-flex rounded-full border border-border p-0.5 text-[12.5px] font-semibold">
        {(
          [
            ["android", "Android"],
            ["ios", "iPhone"],
            ["desktop", "Ordinateur"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPlatform(key)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              platform === key
                ? "bg-primary text-on-primary"
                : "text-text-dim hover:text-text",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {platform === "ios" && (
        <ol className="flex flex-col gap-3">
          <Step n={1} icon={<Share className="size-4" />}>
            En bas de Safari, touchez l&apos;icône <strong>Partager</strong>{" "}
            (le carré avec une flèche vers le haut).
          </Step>
          <Step n={2} icon={<SquarePlus className="size-4" />}>
            Faites défiler et choisissez{" "}
            <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
          </Step>
          <Step n={3} icon={<Check className="size-4" />}>
            Touchez <strong>« Ajouter »</strong>. L&apos;icône Athena apparaît
            sur votre écran d&apos;accueil.
          </Step>
        </ol>
      )}

      {platform === "android" && (
        <>
          {canPrompt ? (
            <div>
              <p className="mb-3 text-[14px] text-text-dim">
                Votre navigateur peut installer Athena en un tap :
              </p>
              <Button
                onClick={async () => {
                  await deferred.prompt();
                  await deferred.userChoice;
                  setDeferred(null);
                }}
              >
                <Download className="size-4" />
                Installer Athena
              </Button>
              <p className="mt-3 text-[12.5px] text-text-faint">
                Rien ne s&apos;affiche ? Suivez les étapes ci-dessous.
              </p>
            </div>
          ) : null}
          <ol
            className={cn(
              "flex flex-col gap-3",
              canPrompt && "mt-4 border-t border-border pt-4",
            )}
          >
            <Step n={1} icon={<MoreVertical className="size-4" />}>
              Touchez le menu <strong>⋮</strong> en haut à droite de Chrome.
            </Step>
            <Step n={2} icon={<SquarePlus className="size-4" />}>
              Choisissez{" "}
              <strong>
                « Installer l&apos;application »
              </strong>{" "}
              (ou « Ajouter à l&apos;écran d&apos;accueil »).
            </Step>
            <Step n={3} icon={<Check className="size-4" />}>
              Confirmez. Athena s&apos;ajoute à votre écran d&apos;accueil.
            </Step>
          </ol>
        </>
      )}

      {platform === "desktop" && (
        <>
          {canPrompt && (
            <Button
              className="mb-4"
              onClick={async () => {
                await deferred.prompt();
                await deferred.userChoice;
                setDeferred(null);
              }}
            >
              <Download className="size-4" />
              Installer Athena
            </Button>
          )}
          <ol className="flex flex-col gap-3">
            <Step n={1} icon={<Download className="size-4" />}>
              Dans la barre d&apos;adresse, cliquez sur l&apos;icône
              d&apos;installation (un écran avec une flèche).
            </Step>
            <Step n={2} icon={<Check className="size-4" />}>
              Cliquez sur <strong>« Installer »</strong>. Athena s&apos;ouvre
              dans sa propre fenêtre.
            </Step>
          </ol>
        </>
      )}
    </div>
  );
}

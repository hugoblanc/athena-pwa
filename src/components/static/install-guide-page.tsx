"use client";

import {
  ArrowUpFromLine,
  BellRing,
  Check,
  CheckCircle2,
  Compass,
  Download,
  Gift,
  MonitorDown,
  MoreVertical,
  ShieldCheck,
  Smartphone,
  SquarePlus,
  WifiOff,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { promptInstall, useCanInstall } from "@/lib/a2hs";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { isInAppBrowser, isIOS, isStandalone } from "@/lib/pwa";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (isIOS()) return "ios";
  if (typeof navigator !== "undefined" && /android/i.test(navigator.userAgent)) {
    return "android";
  }
  return "desktop";
}

/** iOS hors Safari (Chrome/Firefox iOS) : l'install A2HS n'y est pas dispo. */
function isIosNonSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return isIOS() && /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
}

const PLATFORMS: { key: Platform; label: string; icon: typeof Compass }[] = [
  { key: "ios", label: "iPhone", icon: Compass },
  { key: "android", label: "Android", icon: Smartphone },
  { key: "desktop", label: "Ordinateur", icon: MonitorDown },
];

/** Carte d'étape numérotée, visuelle. */
function StepCard({
  n,
  title,
  children,
  chip,
}: {
  n: number;
  title: ReactNode;
  children?: ReactNode;
  /** Pastille illustrant le contrôle à toucher (icône réelle). */
  chip?: ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-[16px] font-extrabold text-on-primary">
        {n}
      </span>
      <div className="flex-1">
        <p className="font-display text-[15px] font-bold leading-snug text-text">
          {title}
        </p>
        {children && (
          <p className="mt-1 text-[13.5px] leading-snug text-text-dim">
            {children}
          </p>
        )}
      </div>
      {chip && (
        <span className="grid size-10 shrink-0 place-items-center self-center rounded-[12px] bg-surface-2 text-text">
          {chip}
        </span>
      )}
    </li>
  );
}

function Reassurance() {
  const items = [
    { icon: Gift, label: "Gratuit, open-source" },
    { icon: ShieldCheck, label: "Sans pub, sans pistage" },
    { icon: WifiOff, label: "Lecture hors ligne" },
    { icon: BellRing, label: "Notifs des publications" },
  ];
  return (
    <ul className="mt-8 grid grid-cols-2 gap-2.5">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2.5 rounded-[var(--radius)] border border-border bg-surface px-3.5 py-3"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary/15 text-primary">
            <Icon className="size-[18px]" />
          </span>
          <span className="text-[12.5px] font-semibold leading-tight text-text-dim">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Page-guide d'installation PWA **adaptative et pédagogique**. Détecte
 * iOS / Android / ordinateur, propose le bon parcours en grosses étapes
 * visuelles, gère le 1-tap Android (`beforeinstallprompt`), l'état « déjà
 * installé », les navigateurs in-app et le cas iOS hors Safari. Pensée pour être
 * partagée (réponses Play Store, support) vers les users à migrer.
 */
export function InstallGuidePageContent() {
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>("android");
  const [autoDetected, setAutoDetected] = useState<Platform>("android");
  const [standalone, setStandalone] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosNonSafari, setIosNonSafari] = useState(false);
  // Invite native partagée (capturée globalement, survit à la nav /share → ici).
  const canInstall = useCanInstall();

  useEffect(() => {
    setMounted(true);
    const p = detectPlatform();
    setPlatform(p);
    setAutoDetected(p);
    setStandalone(isStandalone());
    setInApp(isInAppBrowser());
    setIosNonSafari(isIosNonSafari());

    const onInstalled = () => {
      setInstalled(true);
      track("install", { refType: "content", refId: "installer", ref: "installer" });
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const canPrompt = platform !== "ios" && canInstall;

  async function install() {
    await promptInstall();
  }

  return (
    <div className="mx-auto max-w-[560px] px-5 pb-16 pt-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="grid size-[72px] place-items-center rounded-[20px] bg-gradient-to-br from-brand-500 to-brand-600 font-display text-[36px] font-extrabold text-white shadow-[0_10px_40px_rgba(252,116,58,0.4)]">
          A
        </div>
        <h1 className="mt-5 font-display text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em] text-text">
          Installez Athena sur votre appareil
        </h1>
        <p className="mt-2.5 text-[14.5px] leading-snug text-text-dim">
          En moins d&apos;une minute, ajoutez l&apos;app des médias libres à
          votre écran d&apos;accueil. Pas de store, pas de compte.
        </p>
      </div>

      {/* États spéciaux */}
      {mounted && (standalone || installed) ? (
        <div className="mt-7 flex items-center gap-3 rounded-[var(--radius)] border border-primary/30 bg-primary/10 p-4">
          <CheckCircle2 className="size-7 shrink-0 text-primary" />
          <div>
            <p className="font-display text-[15px] font-bold text-text">
              Athena est déjà installé 🎉
            </p>
            <p className="mt-0.5 text-[13px] text-text-dim">
              Lancez-le depuis votre écran d&apos;accueil.
            </p>
          </div>
        </div>
      ) : mounted && inApp ? (
        <div className="mt-7 rounded-[var(--radius)] border border-primary/30 bg-surface p-4">
          <p className="font-display text-[15px] font-bold text-text">
            Ouvrez d&apos;abord cette page dans votre navigateur
          </p>
          <p className="mt-1.5 text-[13.5px] leading-snug text-text-dim">
            Vous êtes dans le navigateur intégré d&apos;une autre app, qui ne
            permet pas l&apos;installation. Touchez le menu (souvent{" "}
            <MoreVertical className="inline size-4 align-text-bottom" /> en haut)
            puis «&nbsp;Ouvrir dans Chrome&nbsp;» ou «&nbsp;Safari&nbsp;», et
            revenez sur cette page.
          </p>
        </div>
      ) : (
        <>
          {/* Détection + sélecteur d'appareil */}
          <div className="mt-7">
            <p className="mb-2.5 text-center text-[12.5px] text-text-faint">
              {mounted
                ? `Détecté : ${PLATFORMS.find((p) => p.key === autoDetected)?.label}. Pas le bon ?`
                : "Choisissez votre appareil"}
            </p>
            <div className="flex justify-center">
              <div className="inline-flex rounded-full border border-border bg-surface p-1 text-[13px] font-semibold">
                {PLATFORMS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPlatform(key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors",
                      platform === key
                        ? "bg-primary text-on-primary"
                        : "text-text-dim hover:text-text",
                    )}
                  >
                    <Icon className="size-[15px]" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 1-tap Android / Desktop */}
          {canPrompt && (
            <button
              type="button"
              onClick={install}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-5 py-4 font-display text-[16px] font-bold text-on-primary shadow-elev-1 transition-colors hover:bg-primary-hover"
            >
              <Download className="size-5" />
              Installer Athena maintenant
            </button>
          )}

          {/* Étapes par plateforme */}
          <ol className="mt-6 flex flex-col gap-3">
            {platform === "ios" && (
              <>
                {iosNonSafari && (
                  <li className="rounded-[var(--radius)] border border-primary/30 bg-primary/10 p-3.5 text-[13.5px] leading-snug text-text">
                    Sur iPhone, l&apos;installation ne marche que depuis{" "}
                    <strong>Safari</strong>. Ouvrez cette page dans Safari pour
                    continuer.
                  </li>
                )}
                <StepCard
                  n={1}
                  title="Touchez l'icône Partager"
                  chip={<ArrowUpFromLine className="size-5" />}
                >
                  En bas de Safari, le carré avec une flèche vers le haut.
                </StepCard>
                <StepCard
                  n={2}
                  title="« Sur l'écran d'accueil »"
                  chip={<SquarePlus className="size-5" />}
                >
                  Faites défiler la liste et choisissez cette option.
                </StepCard>
                <StepCard
                  n={3}
                  title="Touchez « Ajouter »"
                  chip={<Check className="size-5" />}
                >
                  L&apos;icône Athena apparaît sur votre écran d&apos;accueil.
                </StepCard>
              </>
            )}

            {platform === "android" && (
              <>
                {canPrompt ? (
                  <li className="rounded-[var(--radius)] border border-border bg-surface p-3.5 text-[13px] text-text-dim">
                    Le bouton ci-dessus ne fait rien&nbsp;? Suivez ces étapes :
                  </li>
                ) : null}
                <StepCard
                  n={1}
                  title="Ouvrez le menu de Chrome"
                  chip={<MoreVertical className="size-5" />}
                >
                  L&apos;icône <strong>⋮</strong> en haut à droite.
                </StepCard>
                <StepCard
                  n={2}
                  title="« Installer l'application »"
                  chip={<SquarePlus className="size-5" />}
                >
                  Ou «&nbsp;Ajouter à l&apos;écran d&apos;accueil&nbsp;».
                </StepCard>
                <StepCard
                  n={3}
                  title="Confirmez"
                  chip={<Check className="size-5" />}
                >
                  Athena s&apos;ajoute à votre écran d&apos;accueil.
                </StepCard>
              </>
            )}

            {platform === "desktop" && (
              <>
                <StepCard
                  n={1}
                  title="Cliquez sur l'icône d'installation"
                  chip={<MonitorDown className="size-5" />}
                >
                  Dans la barre d&apos;adresse, à droite (un écran avec une
                  flèche). Sinon, menu du navigateur → «&nbsp;Installer
                  Athena&nbsp;».
                </StepCard>
                <StepCard
                  n={2}
                  title="Cliquez sur « Installer »"
                  chip={<Check className="size-5" />}
                >
                  Athena s&apos;ouvre dans sa propre fenêtre, comme une app.
                </StepCard>
              </>
            )}
          </ol>
        </>
      )}

      <Reassurance />
    </div>
  );
}

"use client";

import {
  ArrowRight,
  Bell,
  Download,
  Headphones,
  Share,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShareIntents } from "@/components/share/share-intents";
import { useValueReached } from "@/components/share/use-value-reached";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import {
  isAndroid,
  isInAppBrowser,
  isIOS,
  isRelatedAppInstalled,
  isStandalone,
} from "@/lib/pwa";
import type { ShareRefType } from "@/lib/site";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Funnel de conversion d'une landing de partage. Objectif #1 : transformer le
 * visiteur (forte intention — il a cliqué pour CE contenu) en **install PWA**
 * quand il est sur mobile et ne l'a pas déjà installée.
 *
 * Détection (cf. `lib/pwa.ts`) :
 * - `standalone` ou `getInstalledRelatedApps()` → déjà installée → on ne pousse
 *   pas l'install, on mène à la lecture.
 * - in-app browser (WhatsApp/IG…) → install impossible → on invite à ouvrir
 *   dans le navigateur, et on garde le re-partage comme conversion.
 * - mobile non installé → **install en action primaire**, lecture en secondaire.
 *
 * Mesure : `preview_view` à l'arrivée, `value_reached` quand la valeur est reçue
 * (révèle le re-partage = k-factor), `install` sur `appinstalled` (install réel).
 */
export function ShareFunnel({
  refType,
  refId,
  sharePath,
  title,
  contentHref,
  isVideo = false,
}: {
  refType: ShareRefType;
  refId: string;
  /** Chemin canonique de la ressource (via `sharePath.*`). */
  sharePath: string;
  title: string;
  /** Lien interne de lecture complète : `/content/:key/:contentId`. */
  contentHref: string;
  isVideo?: boolean;
}) {
  const { reached } = useValueReached();
  const [mounted, setMounted] = useState(false);
  const [ios, setIos] = useState(false);
  const [android, setAndroid] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [inApp, setInApp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
    const sa = isStandalone();
    setIos(isIOS());
    setAndroid(isAndroid());
    setStandalone(sa);
    setInApp(isInAppBrowser());
    if (sa) setInstalled(true);

    track("preview_view", { refType, refId, ref: "landing" });

    // Signal fort « déjà installée » (Chrome Android, manifest related_applications).
    void isRelatedAppInstalled().then((yes) => {
      if (yes) setInstalled(true);
    });

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      track("install", { refType, refId, ref: "landing" });
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [refType, refId]);

  useEffect(() => {
    if (reached) track("value_reached", { refType, refId, ref: "landing" });
  }, [reached, refType, refId]);

  const mobile = ios || android;
  const pushInstall = mounted && mobile && !standalone && !installed && !inApp;
  const readCta = isVideo ? "Regarder la vidéo" : "Lire l'article";

  async function promptInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice; // l'event `appinstalled` mesure l'install réelle
  }

  return (
    <section className="mt-5 flex flex-col gap-3">
      {pushInstall ? (
        /* ── MOBILE NON INSTALLÉ : install en action primaire ───────────── */
        <div className="rounded-[var(--radius)] border border-primary/30 bg-surface p-5 shadow-elev-1">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-primary/15 text-primary">
              <Download className="size-[22px]" />
            </span>
            <div>
              <h2 className="font-display text-[17px] font-extrabold leading-tight">
                Installez Athena
              </h2>
              <p className="text-[13px] text-text-dim">
                L&apos;actu des médias libres, en accès direct
              </p>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            <FeatureLi icon={Headphones}>
              {readCta.replace("Regarder", "Écouter")} + écoute audio (TTS)
            </FeatureLi>
            <FeatureLi icon={Bell}>
              Notifications des nouvelles publications
            </FeatureLi>
            <FeatureLi icon={WifiOff}>Hors ligne, sans pub, gratuit</FeatureLi>
          </ul>

          {ios && !deferred ? (
            <p className="mt-4 rounded-[10px] bg-surface-2 px-3.5 py-3 text-[13px] text-text-dim">
              Touchez <Share className="inline size-4 align-text-bottom" /> en
              bas de l&apos;écran, puis «&nbsp;Sur l&apos;écran d&apos;accueil
              &nbsp;» pour installer Athena.
            </p>
          ) : deferred ? (
            <Button
              onClick={promptInstall}
              className="mt-4 h-12 w-full text-[15px]"
            >
              <Download />
              Installer l&apos;application
            </Button>
          ) : (
            <p className="mt-4 rounded-[10px] bg-surface-2 px-3.5 py-3 text-[13px] text-text-dim">
              Ouvrez le menu de votre navigateur (⋮) puis «&nbsp;Installer
              l&apos;application&nbsp;».
            </p>
          )}

          {!deferred && (
            <Link
              href="/installer"
              className="mt-3 block text-center text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Voir le guide d&apos;installation détaillé
            </Link>
          )}

          <Link
            href={contentHref}
            className="mt-3 flex items-center justify-center gap-1.5 text-[13.5px] font-semibold text-text-dim transition-colors hover:text-text"
          >
            Lire maintenant sans installer
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : mounted && inApp && mobile && !standalone ? (
        /* ── NAVIGATEUR IN-APP : install impossible → ouvrir dehors ──────── */
        <div className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-elev-1">
          <h2 className="font-display text-[15px] font-bold">
            Ouvrez Athena dans votre navigateur
          </h2>
          <p className="mt-1.5 text-[13px] text-text-dim">
            Pour installer l&apos;app, touchez le menu (•••) en haut puis
            «&nbsp;Ouvrir dans le navigateur&nbsp;».
          </p>
          <Button
            render={<Link href={contentHref} />}
            variant="secondary"
            className="mt-4 w-full"
          >
            {readCta} maintenant
            <ArrowRight />
          </Button>
        </div>
      ) : (
        /* ── DESKTOP / DÉJÀ INSTALLÉE : lecture en action primaire ───────── */
        <div className="rounded-[var(--radius)] border border-border bg-surface p-5 shadow-elev-1">
          <Button
            render={<Link href={contentHref} />}
            className="h-12 w-full text-[15px]"
          >
            {readCta} dans Athena
            <ArrowRight />
          </Button>
          {mounted && !installed && !standalone && deferred && (
            <button
              type="button"
              onClick={promptInstall}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-[13.5px] font-semibold text-text-dim transition-colors hover:text-text"
            >
              <Download className="size-4" />
              Installer l&apos;app pour un accès rapide
            </button>
          )}
        </div>
      )}

      {/* k-factor : re-partage révélé APRÈS la valeur reçue (numérateur viral). */}
      {reached && (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-[18px] shadow-elev-1">
          <h2 className="font-display text-[15px] font-bold">
            Partagez à votre tour
          </h2>
          <p className="mb-3 mt-1.5 text-[13px] text-text-dim">
            Faites circuler l&apos;info auprès de ceux que ça intéresse.
          </p>
          <ShareIntents
            path={sharePath}
            title={title}
            refType={refType}
            refId={refId}
          />
        </div>
      )}
    </section>
  );
}

function FeatureLi({
  icon: Icon,
  children,
}: {
  icon: typeof Headphones;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2.5 text-[13px] text-text-dim">
      <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      {children}
    </li>
  );
}

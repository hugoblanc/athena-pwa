"use client";

import { Dialog } from "@base-ui/react/dialog";
import { BellRing, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, IconButton } from "@/components/ui/button";
import {
  enableAndFollow,
  isPushSupported,
  subscribeToPush,
} from "@/lib/api/push";
import { cn } from "@/lib/cn";
import { isIOS, isStandalone } from "@/lib/pwa";

/** Délai de lecture avant de proposer l'opt-in (ms). */
const READ_DELAY_MS = 12_000;
/** Re-proposition après un « Plus tard » (ms) : ~5 jours. */
const SNOOZE_MS = 5 * 24 * 60 * 60 * 1000;
const SNOOZE_KEY = "athena.notif.snoozedUntil";

function snoozedUntil(): number {
  try {
    return Number(window.localStorage.getItem(SNOOZE_KEY) || 0);
  } catch {
    return 0;
  }
}
function snooze() {
  try {
    window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* storage indisponible : tant pis */
  }
}

/** Permission actuelle, défensif (Notification absent sur certains navigateurs). */
function permission(): NotificationPermission | "unsupported" {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/**
 * Décide si l'on peut envisager d'afficher la fenêtre (avant le timer).
 * iOS non installé : on l'affiche quand même, mais en variante « installer d'abord »
 * (le web push iOS exige la PWA sur l'écran d'accueil).
 */
function shouldConsider(): boolean {
  if (typeof window === "undefined") return false;
  if (Date.now() < snoozedUntil()) return false;
  // iOS Safari (onglet) : push impossible sans install → on guide vers l'install.
  if (isIOS() && !isStandalone()) return true;
  if (!isPushSupported()) return false;
  const p = permission();
  // Déjà accordé ou refusé : on ne redemande pas.
  return p === "default";
}

type Phase = "intro" | "ios-install" | "done";

/**
 * Fenêtre d'opt-in notifications, déclenchée après ~12 s de lecture (pas à
 * l'arrivée, pour ne pas agresser). Non bloquante, snooze au refus.
 *
 * - Android / desktop : demande la permission + abonne (web push anonyme).
 * - iOS non installé : explique qu'il faut ajouter Athena à l'écran d'accueil.
 *
 * `mediaTitle`/`mediaKey` (optionnels) personnalisent l'accroche et abonnent au
 * média lu (ciblage des notifs).
 */
export function NotifyOptInSheet({
  mediaTitle,
  mediaKey,
}: {
  mediaTitle?: string;
  mediaKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!shouldConsider()) return;
    const t = setTimeout(() => {
      // iOS non installé → variante install ; sinon intro classique.
      setPhase(isIOS() && !isStandalone() ? "ios-install" : "intro");
      setOpen(true);
    }, READ_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function close(withSnooze: boolean) {
    if (withSnooze) snooze();
    setOpen(false);
  }

  async function handleEnable() {
    setPending(true);
    try {
      // déclenche la demande de permission (geste user) + suit le média lu si connu
      if (mediaKey) await enableAndFollow(mediaKey);
      else await subscribeToPush();
      setPhase("done");
    } catch {
      // refus de permission ou échec : on n'insiste pas, on re-proposera plus tard.
      close(true);
    } finally {
      setPending(false);
    }
  }

  const source = mediaTitle?.trim();
  const intro = source
    ? `On peut vous prévenir dès que ${source} publie un nouvel article — et plus largement quand les médias indépendants sortent quelque chose qui compte.`
    : "On peut vous prévenir dès qu'un média indépendant publie un nouvel article qui compte.";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close(true);
        else setOpen(true);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex flex-col gap-4 border border-border bg-surface p-5 shadow-elev-1 outline-none",
            "inset-x-0 bottom-0 rounded-t-[18px] pb-[max(20px,env(safe-area-inset-bottom))]",
            "transition-transform duration-250 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(440px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[18px] sm:pb-5",
            "sm:transition-[transform,opacity] sm:data-[ending-style]:translate-y-[-50%] sm:data-[ending-style]:scale-95 sm:data-[ending-style]:opacity-0 sm:data-[starting-style]:translate-y-[-50%] sm:data-[starting-style]:scale-95 sm:data-[starting-style]:opacity-0",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-primary/15 text-primary">
              <BellRing className="size-5" />
            </span>
            <Dialog.Close
              render={
                <IconButton
                  aria-label="Fermer"
                  className="-mr-1 -mt-1 size-9 [&_svg]:size-[18px]"
                />
              }
            >
              <X />
            </Dialog.Close>
          </div>

          {phase === "done" ? (
            <>
              <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
                C'est activé 🔔
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-dim">
                Vous recevrez une notification aux prochains articles. Vous
                pourrez vous désabonner à tout moment dans les réglages.
              </Dialog.Description>
              <Dialog.Close render={<Button variant="primary">Parfait</Button>} />
            </>
          ) : phase === "ios-install" ? (
            <>
              <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
                Activez les notifications
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-dim">
                {intro} Sur iPhone, ajoutez d'abord Athena à votre écran
                d'accueil — c'est gratuit et ça prend 15 secondes.
              </Dialog.Description>
              <div className="flex flex-col gap-2">
                <Button render={<Link href="/installer" />} variant="primary">
                  Ajouter à l'écran d'accueil
                </Button>
                <Button variant="ghost" onClick={() => close(true)}>
                  Plus tard
                </Button>
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="font-display text-[19px] font-extrabold tracking-[-0.01em]">
                Rester au courant ?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-text-dim">
                {intro}
              </Dialog.Description>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={handleEnable}
                  disabled={pending}
                >
                  {pending ? "Activation…" : "Activer les notifications"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => close(true)}
                  disabled={pending}
                >
                  Plus tard
                </Button>
              </div>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Invite à installer la PWA (« Ajouter à l'écran d'accueil »).
 * Clé pour activer le Web Push sur iOS (PWA installée requise, 16.4+).
 * - Android/Chrome : utilise `beforeinstallprompt`.
 * - iOS Safari : affiche les instructions manuelles (pas d'API d'install).
 */
export function A2HSPrompt({ onClose }: { onClose?: () => void }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    if (isIOS()) setVisible(true); // iOS : pas d'event, on montre les instructions
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible) return null;

  function close() {
    setVisible(false);
    onClose?.();
  }

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4 shadow-elev-1">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-primary/15 text-primary">
          <Download className="size-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-[15px] font-bold">
            Installer Athena
          </h3>
          {isIOS() && !deferred ? (
            <p className="mt-1 text-[13px] text-text-dim">
              Touchez <Share className="inline size-4 align-text-bottom" /> puis
              « Sur l&apos;écran d&apos;accueil » pour installer l&apos;app et
              activer les notifications.
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-text-dim">
              Installez l&apos;app pour un accès rapide et les notifications.
            </p>
          )}
          {deferred && (
            <Button
              size="sm"
              className="mt-3"
              onClick={async () => {
                await deferred.prompt();
                await deferred.userChoice;
                close();
              }}
            >
              Installer
            </Button>
          )}
        </div>
        <button aria-label="Fermer" onClick={close} className="text-text-faint hover:text-text">
          <X className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

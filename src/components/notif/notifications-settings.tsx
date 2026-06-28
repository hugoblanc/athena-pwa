"use client";

import { ArrowLeft, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsList, SettingsRow } from "@/components/auth/settings-list";
import { Switch } from "@/components/ui/switch";
import {
  currentPushSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/api/push";
import { isIOS, isStandalone } from "@/lib/pwa";

type Permission = NotificationPermission | "unsupported";

/** Permission notifications courante, défensif (API absente sur certains navigateurs). */
function readPermission(): Permission {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

/**
 * Réglages des notifications push : interrupteur global d'activation câblé sur
 * `subscribeToPush` / `unsubscribeFromPush`, état de la permission navigateur et
 * message contextuel si l'autorisation est refusée ou impossible (iOS non installé).
 */
export function NotificationsSettings() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<Permission>("unsupported");
  const [pending, setPending] = useState(false);
  // iOS hors PWA : le web push exige l'installation sur l'écran d'accueil.
  const [needsInstall, setNeedsInstall] = useState(false);

  useEffect(() => {
    let active = true;
    setNeedsInstall(isIOS() && !isStandalone());
    setPermission(readPermission());
    currentPushSubscription()
      .then((sub) => active && setEnabled(Boolean(sub)))
      .catch(() => active && setEnabled(false))
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const supported = isPushSupported();
  const denied = permission === "denied";
  const blocked = !supported || denied || needsInstall;

  async function handleToggle(next: boolean) {
    if (pending || blocked) return;
    setPending(true);
    setEnabled(next); // optimiste
    try {
      if (next) await subscribeToPush();
      else await unsubscribeFromPush();
      setPermission(readPermission());
    } catch {
      setEnabled(!next); // rollback (permission refusée / échec réseau)
      setPermission(readPermission());
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-5 pb-24 pt-4 lg:pb-10 lg:pt-6">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-dim transition-colors hover:text-text"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        Profil
      </Link>

      <h1 className="mb-2 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        Notifications
      </h1>
      <p className="mb-6 text-sm text-text-dim">
        {"Soyez prévenu dès qu'un média indépendant publie un nouveau contenu qui compte. Activable et désactivable à tout moment."}
      </p>

      <SettingsList>
        <SettingsRow
          icon={enabled && !blocked ? Bell : BellOff}
          label="Notifications push"
          trailing={
            <Switch
              checked={enabled && !blocked}
              onCheckedChange={handleToggle}
              disabled={!ready || pending || blocked}
              aria-label="Activer les notifications push"
            />
          }
        />
      </SettingsList>

      {/* Messages contextuels selon l'état de la permission / plateforme. */}
      {needsInstall ? (
        <div className="mt-4 rounded-[var(--radius)] border border-border bg-surface-2 p-4">
          <p className="text-sm text-text-dim">
            {"Sur iPhone et iPad, les notifications nécessitent d'ajouter d'abord Athena à votre écran d'accueil."}
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            render={<Link href="/installer" />}
          >
            Installer Athena
          </Button>
        </div>
      ) : !supported ? (
        <p className="mt-4 rounded-[var(--radius)] border border-border bg-surface-2 p-4 text-sm text-text-dim">
          Votre navigateur ne prend pas en charge les notifications push.
        </p>
      ) : denied ? (
        <div className="mt-4 rounded-[var(--radius)] border border-danger/35 bg-surface-2 p-4">
          <p className="text-sm text-text-dim">
            Les notifications sont bloquées dans les réglages de votre
            navigateur. Autorisez-les pour Athena, puis revenez activer cet
            interrupteur.
          </p>
        </div>
      ) : (
        <p className="mt-4 px-1 text-[13px] text-text-faint">
          {permission === "granted"
            ? "Vous pouvez vous désabonner à tout moment depuis cet écran."
            : "Votre navigateur vous demandera l'autorisation à l'activation."}
        </p>
      )}

      {/* Garde-fou : un compte n'est pas requis pour le push (opt-in anonyme),
          mais on offre un retour rapide vers le suivi par média. */}
      <div className="mt-8">
        <Button variant="ghost" onClick={() => router.push("/medias")}>
          Choisir les médias à suivre
        </Button>
      </div>
    </div>
  );
}

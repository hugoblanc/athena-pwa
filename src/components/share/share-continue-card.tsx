"use client";

import { Bell, Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import { A2HSPrompt } from "@/components/pwa/a2hs-prompt";
import { ShareIntents } from "@/components/share/share-intents";
import { useValueReached } from "@/components/share/use-value-reached";
import { track } from "@/lib/analytics";
import { isInAppBrowser, isStandalone } from "@/lib/pwa";
import type { ShareRefType } from "@/lib/site";

/**
 * Moteur de conversion sous la preview de partage. Ferme la growth loop :
 * 1. mesure l'arrivée (`preview_view`) et la valeur consommée (`value_reached`) ;
 * 2. révèle, APRÈS la valeur, le RE-PARTAGE (conversion primaire, le numérateur
 *    du k-factor) — de simples liens qui marchent même en navigateur in-app ;
 * 3. propose l'install (conversion secondaire) seulement hors in-app browser et
 *    si l'app n'est pas déjà installée.
 */
export function ShareContinueCard({
  refType,
  refId,
  sharePath,
  title,
}: {
  refType: ShareRefType;
  refId: string;
  /** Chemin canonique de la ressource (via `sharePath.*`). */
  sharePath: string;
  title: string;
}) {
  const { reached } = useValueReached();
  const [inApp, setInApp] = useState(false);
  const [standalone, setStandalone] = useState(false);

  // Arrivée sur la landing + détection d'environnement (client uniquement).
  useEffect(() => {
    track("preview_view", { refType, refId, ref: "landing" });
    setInApp(isInAppBrowser());
    setStandalone(isStandalone());
  }, [refType, refId]);

  // Valeur réellement consommée (une seule fois).
  useEffect(() => {
    if (reached) track("value_reached", { refType, refId, ref: "landing" });
  }, [reached, refType, refId]);

  return (
    <section className="mt-5 flex flex-col gap-3">
      <div className="rounded-[var(--radius)] border border-border bg-surface p-[18px] shadow-elev-1">
        <h2 className="font-display text-[15px] font-bold">
          Continuer dans Athena
        </h2>
        <p className="mt-1.5 text-[13px] text-text-dim">
          Suivez les médias libres, écoutez les articles en audio et recevez
          l&apos;actu en notifications.
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          <li className="flex items-center gap-2.5 text-[13px] text-text-dim">
            <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary/15 text-primary">
              <Headphones className="size-[18px]" />
            </span>
            Écoute audio (TTS) de chaque contenu
          </li>
          <li className="flex items-center gap-2.5 text-[13px] text-text-dim">
            <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary/15 text-primary">
              <Bell className="size-[18px]" />
            </span>
            Notifications des nouvelles publications
          </li>
        </ul>
      </div>

      {/* Conversion PRIMAIRE — re-partage, révélé après la valeur reçue. */}
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

      {/* Conversion SECONDAIRE — install, hors navigateur in-app et si non installée. */}
      {reached && !inApp && !standalone && <A2HSPrompt />}
    </section>
  );
}

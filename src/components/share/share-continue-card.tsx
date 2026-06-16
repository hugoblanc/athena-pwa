"use client";

import { Bell, Headphones } from "lucide-react";
import { A2HSPrompt } from "@/components/pwa/a2hs-prompt";

/**
 * Bloc « Continuer dans l'app » sous la preview de partage.
 * Transforme un partage entrant en acquisition : rappelle la valeur
 * (audio TTS, notifications) et propose l'installation PWA via le prompt
 * A2HS transverse (réutilisé, non réimplémenté). Le prompt se cache de
 * lui-même si l'app est déjà installée.
 */
export function ShareContinueCard() {
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

      <A2HSPrompt />
    </section>
  );
}

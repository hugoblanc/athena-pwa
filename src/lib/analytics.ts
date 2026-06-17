/**
 * Mesure d'audience AGRÉGÉE de la growth loop (vue / valeur / re-partage).
 *
 * Volontairement minimaliste et respectueux : aucun identifiant persistant
 * côté client, aucune lib tierce. L'événement part en `sendBeacon` vers le BFF
 * Next `/api/loop` (même origine → pas de CORS), qui calcule une empreinte
 * quotidienne non réversible côté serveur puis relaie à l'API NestJS. No-op si
 * « Do Not Track » est activé.
 */

import type { ShareRef, ShareRefType } from "@/lib/site";

export type AnalyticsEvent =
  | "preview_view"
  | "value_reached"
  | "reshare"
  | "install";

export interface TrackProps {
  refType: ShareRefType;
  refId: string;
  /** Canal d'origine (`app`, `landing`, `whatsapp`…). */
  ref?: ShareRef | string;
}

function doNotTrack(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    doNotTrack?: string;
    msDoNotTrack?: string;
  };
  const win =
    typeof window !== "undefined"
      ? (window as Window & { doNotTrack?: string })
      : undefined;
  const v = nav.doNotTrack ?? win?.doNotTrack ?? nav.msDoNotTrack;
  return v === "1" || v === "yes";
}

/**
 * Émet un événement de mesure (best-effort, non bloquant). Échoue en silence.
 */
export function track(event: AnalyticsEvent, props: TrackProps): void {
  if (typeof window === "undefined" || doNotTrack()) return;
  try {
    const body = JSON.stringify({
      event,
      refType: props.refType,
      refId: String(props.refId),
      ref: props.ref,
    });
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon("/api/loop", blob)) return;
    }
    void fetch("/api/loop", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    /* mesure best-effort : on n'interrompt jamais l'UX */
  }
}

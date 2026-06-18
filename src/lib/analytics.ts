/**
 * Mesure d'audience AGRÉGÉE : growth loop de partage (vue / valeur / re-partage)
 * + usage produit (écrans, features, lectures, sessions).
 *
 * Volontairement minimaliste et respectueux : aucun identifiant persistant
 * côté client, aucune lib tierce. L'événement part en `sendBeacon` vers le BFF
 * Next `/api/loop` (même origine → pas de CORS, et nom neutre → non bloqué par
 * uBlock/EasyPrivacy), qui calcule une empreinte quotidienne non réversible
 * côté serveur puis relaie à l'API NestJS. No-op si « Do Not Track » est activé.
 *
 * ⚠️ Vie privée : ne JAMAIS passer de texte libre (requête de recherche, contenu
 * d'une question…) dans `refId`. Les dimensions screen/feature/session sont des
 * valeurs d'une allowlist fermée (côté client ET revalidées côté serveur).
 */

import type { ShareRef, ShareRefType } from "@/lib/site";

export type AnalyticsEvent =
  | "preview_view"
  | "value_reached"
  | "reshare"
  | "install"
  | "screen_view"
  | "feature_use"
  | "play"
  | "session_start";

/** Écrans suivis (doit rester aligné avec ANALYTICS_SCREENS côté API). */
export type ScreenName =
  | "feed"
  | "qa"
  | "laws"
  | "law_detail"
  | "content_detail"
  | "podcasts"
  | "podcast_detail"
  | "media"
  | "profile"
  | "installer"
  | "share"
  | "auth"
  | "info";

/** Features suivies (doit rester aligné avec ANALYTICS_FEATURES côté API). */
export type FeatureName =
  | "search"
  | "filter"
  | "theme_toggle"
  | "qa_ask"
  | "notif_enable"
  | "notif_disable"
  | "media_subscribe"
  | "load_more"
  | "share_open"
  | "player_play"
  | "player_speed"
  | "player_seek"
  | "add_to_home";

export type AnalyticsRefType = ShareRefType | "screen" | "feature" | "session";

export interface TrackProps {
  refType: AnalyticsRefType;
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

/** Vue d'écran (navigation). */
export function trackScreen(screen: ScreenName): void {
  track("screen_view", { refType: "screen", refId: screen });
}

/** Usage d'une feature (action utilisateur). */
export function trackFeature(feature: FeatureName): void {
  track("feature_use", { refType: "feature", refId: feature });
}

/** Lecture d'un contenu/podcast (refId = identifiant du média). */
export function trackPlay(
  refType: Extract<ShareRefType, "content" | "podcast">,
  refId: string,
): void {
  track("play", { refType, refId });
}

/** Début de session : distingue navigateur vs PWA installée (engagement / adoption). */
export function trackSession(mode: "browser" | "installed"): void {
  track("session_start", { refType: "session", refId: mode });
}

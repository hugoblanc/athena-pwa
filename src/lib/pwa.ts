/**
 * Helpers d'environnement PWA (client uniquement). Centralisés ici pour que la
 * growth loop de partage et le prompt d'install partagent la même détection.
 */

/** `true` si l'app tourne en mode installé (standalone / écran d'accueil iOS). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/** `true` sur iPhone/iPad/iPod (pas de `beforeinstallprompt`, install manuelle). */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * `true` dans un navigateur in-app de messagerie/réseau (WhatsApp, Instagram,
 * Facebook, Messenger, TikTok, Snapchat…). C'est le contexte d'atterrissage
 * DOMINANT d'un lien partagé, or `beforeinstallprompt` y est indisponible et
 * `navigator.share` parfois absent → on y masque le CTA d'install et on mise
 * sur le re-partage (simple lien) comme conversion primaire.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|FB_IAB|Instagram|Messenger|WhatsApp|Line\/|Snapchat|TikTok|Twitter|MicroMessenger|; wv\)|WebView/i.test(
    ua,
  );
}

/** `true` sur Android (où `beforeinstallprompt` et getInstalledRelatedApps existent). */
export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

/** `true` sur mobile (iOS ou Android) — la cible du push install. */
export function isMobile(): boolean {
  return isIOS() || isAndroid();
}

interface RelatedApp {
  platform?: string;
  url?: string;
  id?: string;
}

/**
 * Détection FORTE « la PWA est déjà installée » via
 * `navigator.getInstalledRelatedApps()` (Chrome Android uniquement, origine
 * sécurisée, nécessite `related_applications` dans le manifest). Renvoie `false`
 * si l'API est absente (iOS, Firefox, desktop) → on ne peut alors PAS conclure
 * « installée » et on retombe sur les autres signaux (standalone, beforeinstallprompt).
 */
export async function isRelatedAppInstalled(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
  };
  if (typeof nav.getInstalledRelatedApps !== "function") return false;
  try {
    const apps = await nav.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}

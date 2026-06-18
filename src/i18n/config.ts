/**
 * Configuration i18n (next-intl, mode cookie SANS préfixe d'URL).
 *
 * Le CONTENU (articles, podcasts, lois) vient des médias libres français et
 * reste en français quelle que soit la langue choisie — on ne traduit que l'IHM.
 * La locale est persistée dans un cookie (pas dans l'URL) : pas de refonte des
 * routes, share URLs et rewrite `/loi` intacts.
 */

export const locales = ["fr", "en", "fa"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Langues écrites de droite à gauche → `dir="rtl"`. */
export const rtlLocales: readonly Locale[] = ["fa"];

/** Cookie de persistance de la langue (lu côté serveur dans request.ts). */
export const LOCALE_COOKIE = "ATHENA_LOCALE";

/** Libellés natifs affichés dans le sélecteur de langue. */
export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  fa: "فارسی",
};

/** Drapeau (emoji) par langue, pour le sélecteur. */
export const localeFlags: Record<Locale, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
  fa: "🇮🇷",
};

/** Code court affiché dans la variante compacte (top-bar mobile). */
export const localeCodes: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  fa: "FA",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value != null && (locales as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

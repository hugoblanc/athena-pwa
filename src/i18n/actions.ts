"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "./config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Persiste la langue choisie dans le cookie. Appelée par le `LocaleSwitcher`
 * (client) ; le `router.refresh()` qui suit re-rend les Server Components et
 * met à jour `<html lang dir>` côté serveur (pas de flash, RTL inclus).
 */
export async function setLocaleCookie(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
}

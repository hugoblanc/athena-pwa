"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import { SettingsRow } from "@/components/auth/settings-list";
import { setLocaleCookie } from "@/i18n/actions";
import {
  locales,
  localeCodes,
  localeFlags,
  localeNames,
} from "@/i18n/config";

/**
 * Logique commune : applique la locale choisie (cookie via server action) puis
 * `router.refresh()` → re-rend les Server Components et recalcule `<html lang dir>`
 * côté serveur (RTL inclus, sans flash).
 */
function useLocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(async () => {
      await setLocaleCookie(next);
      router.refresh();
    });
  }

  return { locale, pending, onChange };
}

/**
 * Sélecteur compact avec drapeau. `compact` (top-bar mobile) → drapeau + code
 * (🇫🇷 FR) ; sinon (bas de sidebar) → drapeau + nom natif (🇫🇷 Français).
 */
export function LocaleSwitcher({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  const { locale, pending, onChange } = useLocaleSwitch();
  return (
    <select
      value={locale}
      onChange={onChange}
      disabled={pending}
      aria-label={label}
      title={label}
      className={
        compact
          ? "rounded-[var(--radius-sm)] border border-border bg-surface-2 px-2 py-1.5 text-[13px] font-semibold text-text outline-none focus:border-primary disabled:opacity-50"
          : "w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-2.5 py-2 text-[13.5px] font-medium text-text outline-none focus:border-primary disabled:opacity-50"
      }
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeFlags[l]} {compact ? localeCodes[l] : localeNames[l]}
        </option>
      ))}
    </select>
  );
}

/** Sélecteur de langue (ligne de réglages). */
export function LocaleSwitcherRow({ label }: { label: string }) {
  const { locale, pending, onChange } = useLocaleSwitch();

  return (
    <SettingsRow
      icon={Languages}
      label={label}
      trailing={
        <select
          value={locale}
          onChange={onChange}
          disabled={pending}
          aria-label={label}
          className="rounded-[var(--radius-sm)] border border-border bg-surface-2 px-2.5 py-1.5 text-sm font-medium text-text outline-none focus:border-primary disabled:opacity-50"
        >
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeNames[l]}
            </option>
          ))}
        </select>
      }
    />
  );
}

"use client";

import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { useFeedPrefs } from "@/lib/feed-prefs";
import { SettingsRow } from "./settings-list";

/** Bascule mode économie (sans images) persistée dans feedPrefs. */
export function EcoModeRow() {
  const { prefs, setEcoMode } = useFeedPrefs();
  const t = useTranslations("profile");

  return (
    <SettingsRow
      icon={ImageOff}
      label={t("ecoMode")}
      trailing={
        <Switch
          checked={prefs.ecoMode}
          onCheckedChange={setEcoMode}
          aria-label={t("ecoModeToggle")}
        />
      }
    />
  );
}

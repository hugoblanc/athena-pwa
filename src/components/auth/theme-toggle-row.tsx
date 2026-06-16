"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Switch } from "@/components/ui/switch";
import { SettingsRow } from "./settings-list";

const emptySubscribe = () => () => {};

/** `true` une fois monté côté client (évite le mismatch d'hydratation). */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/** Bascule thème clair/sombre via next-themes (rendu après montage pour éviter le mismatch SSR). */
export function ThemeToggleRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = !mounted || resolvedTheme === "dark";

  return (
    <SettingsRow
      icon={isDark ? Moon : Sun}
      label="Thème sombre"
      trailing={
        <Switch
          checked={isDark}
          disabled={!mounted}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          aria-label="Activer le thème sombre"
        />
      }
    />
  );
}

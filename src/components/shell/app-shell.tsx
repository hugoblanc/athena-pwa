import type { ReactNode } from "react";
import { AudioPlayer } from "@/components/player/audio-player";
import { Sidebar } from "./sidebar";
import { TabBar } from "./tab-bar";
import { TopBar } from "./top-bar";

/**
 * Coquille adaptative : sidebar desktop (≥ lg) / tab bar mobile (< lg).
 * Même contenu ; le player audio est monté ICI (singleton, survit à la nav).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr]">
      <Sidebar className="hidden lg:flex lg:sticky lg:top-0" />

      <div className="flex min-h-dvh flex-col">
        <TopBar className="lg:hidden" />

        <main className="flex-1 pb-[160px] lg:pb-[88px]">{children}</main>

        <AudioPlayer />
        <TabBar className="lg:hidden" />
      </div>
    </div>
  );
}

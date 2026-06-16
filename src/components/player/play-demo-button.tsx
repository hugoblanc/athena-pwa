"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayerStore } from "./player-store";

/** Démo : charge une piste de test dans le player (à retirer hors dév). */
export function PlayDemoButton() {
  const play = usePlayerStore((s) => s.play);
  return (
    <Button
      onClick={() =>
        play({
          id: "demo-1",
          title: "Économie de la décroissance : utopie ou nécessité ?",
          source: "Thinkerview",
          audioUrl:
            "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          href: "/podcasts/demo-1",
        })
      }
    >
      <Play />
      Tester le player
    </Button>
  );
}

"use client";

import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { replayOnboarding } from "@/components/onboarding/onboarding-overlay";

/** Re-déclenche l'overlay tuto depuis la page Informations. */
export function ReplayTutorialButton() {
  return (
    <Button variant="secondary" size="sm" onClick={replayOnboarding}>
      <PlayCircle />
      Revoir le tutoriel
    </Button>
  );
}

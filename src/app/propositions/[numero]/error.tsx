"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-10">
      <EmptyState
        icon={AlertTriangle}
        title="Impossible de charger la proposition"
        description="Une erreur est survenue. Vérifiez votre connexion puis réessayez."
        action={
          <Button variant="secondary" onClick={reset}>
            Réessayer
          </Button>
        }
      />
    </div>
  );
}

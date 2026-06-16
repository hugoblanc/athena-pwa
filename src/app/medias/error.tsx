"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function MediasError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <EmptyState
        icon={AlertTriangle}
        title="Impossible de charger les médias"
        description="Une erreur est survenue. Vérifiez votre connexion puis réessayez."
        action={<Button onClick={reset}>Réessayer</Button>}
      />
    </div>
  );
}

"use client";

import { ImageOff } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Erreur réseau non-404 sur l'aperçu : le contenu peut exister même si
 * l'aperçu échoue → on propose d'ouvrir directement la lecture dans Athena.
 */
export default function ShareError({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ key: string; contentId: string }>();
  const contentHref =
    params?.key && params?.contentId
      ? `/content/${params.key}/${params.contentId}`
      : "/";

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:px-8 lg:pt-8">
      <EmptyState
        icon={ImageOff}
        title="Aperçu indisponible"
        description="Impossible de charger l'aperçu de ce contenu pour le moment. Vous pouvez tout de même l'ouvrir dans Athena."
        action={
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Button render={<Link href={contentHref} />}>
              Ouvrir dans Athena
            </Button>
            <Button variant="ghost" onClick={reset}>
              Réessayer
            </Button>
          </div>
        }
      />
    </div>
  );
}

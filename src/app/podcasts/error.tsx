"use client";

import { Button } from "@/components/ui/button";

export default function PodcastsError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-16 text-center">
      <h1 className="font-display text-[20px] font-extrabold">
        Impossible de charger les podcasts
      </h1>
      <p className="mt-2 text-sm text-text-dim">
        Une erreur est survenue. Réessayez dans un instant.
      </p>
      <div className="mt-5">
        <Button variant="secondary" onClick={reset}>
          Réessayer
        </Button>
      </div>
    </div>
  );
}

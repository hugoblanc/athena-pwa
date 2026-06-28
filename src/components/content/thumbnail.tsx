"use client";

import { useState } from "react";
import { hiResYoutubeThumbnail } from "@/lib/youtube-thumbnail";

/**
 * Vignette de contenu. Pour les grands rendus (`hiRes`), tente la variante
 * YouTube haute résolution et retombe sur l'URL d'origine si elle n'existe pas
 * (404), ce qui évite la pixellisation des vidéos sans régression.
 */
export function Thumbnail({
  src,
  hiRes = false,
  className,
  alt = "",
}: {
  src: string;
  hiRes?: boolean;
  className?: string;
  alt?: string;
}) {
  const candidate = hiRes ? hiResYoutubeThumbnail(src) : src;
  // On mémorise le candidat qui a échoué (pas un simple booléen) pour réessayer
  // la HD si la carte est recyclée vers un autre contenu.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = failedSrc === candidate ? src : candidate;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (candidate !== src) setFailedSrc(candidate);
      }}
    />
  );
}

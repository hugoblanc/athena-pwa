"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Détecte le moment où un visiteur a réellement « consommé » la valeur d'une
 * page d'atterrissage de partage : scroll ≥ 60 %, ou 8 s passées, ou signal
 * manuel (clic lecture). One-shot. Sert à ne révéler les CTA (re-partage,
 * install) qu'APRÈS la valeur reçue, jamais avant.
 */
export function useValueReached(): {
  reached: boolean;
  markReached: () => void;
} {
  const [reached, setReached] = useState(false);
  const done = useRef(false);

  // Stable : utilisable comme dépendance / callback sans re-render.
  const markRef = useRef(() => {
    if (done.current) return;
    done.current = true;
    setReached(true);
  });

  useEffect(() => {
    const mark = markRef.current;
    if (done.current) return;

    const timer = window.setTimeout(mark, 8000);
    const onScroll = () => {
      const el = document.documentElement;
      const ratio = (el.scrollTop + window.innerHeight) / el.scrollHeight;
      if (ratio >= 0.6) mark();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return { reached, markReached: markRef.current };
}

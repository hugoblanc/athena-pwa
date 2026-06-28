"use client";

import { useEffect, useState } from "react";

/**
 * Barre de progression de lecture : fine ligne d'accent fixée sous le header,
 * dont la largeur reflète la part déjà défilée de la page.
 *
 * Sans dépendance : écoute le scroll fenêtre (throttlé via rAF) et se cale
 * automatiquement sous le header mobile (sticky) — qui mesure 0 en hauteur sur
 * desktop (`lg:hidden`), la barre se loge alors en haut du viewport.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [top, setTop] = useState(0);

  // Cale la barre sous le header (hauteur dynamique : safe-area + contenu).
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      setTop(header?.getBoundingClientRect().height ?? 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{ top }}
      className="pointer-events-none fixed inset-x-0 z-20 h-[3px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-primary transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

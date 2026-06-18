"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";

const SWIPE_THRESHOLD = 80; // px — au-delà : dismiss
const DEAD_ZONE_X = 8; // px — en-dessous : ne pas capturer le pointer

interface DismissableCardProps {
  contentId: string;
  children: ReactNode;
  onDismiss: (contentId: string) => void;
  className?: string;
}

/**
 * Wrapper qui ajoute :
 * - Mobile : swipe gauche (pointer events natifs) avec `touch-action: pan-y`
 *   pour ne pas bloquer le scroll vertical. Retour élastique si < seuil.
 * - Desktop : bouton × en `absolute top-2 right-2` visible au hover.
 * - Indicateur de danger sous la carte pendant le swipe.
 */
export function DismissableCard({
  contentId,
  children,
  onDismiss,
  className,
}: DismissableCardProps) {
  const t = useTranslations("feed");
  const ref = useRef<HTMLDivElement>(null);

  // État du swipe
  const startX = useRef(0);
  const startY = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    startY.current = e.clientY;
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Ne déclencher le swipe qu'en-dessous du seuil de pan vertical
    // et uniquement vers la gauche (dx < 0)
    if (!swiping && Math.abs(dx) < DEAD_ZONE_X) return;

    // Si l'axe dominant est vertical, on laisse le scroll se faire
    if (!swiping && Math.abs(dy) > Math.abs(dx)) return;

    if (dx >= 0) return; // pas de swipe vers la droite

    // Capture le pointer pour recevoir les events même hors de l'élément
    if (!swiping) {
      try {
        ref.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setSwiping(true);
    }

    setTranslateX(dx);
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!swiping) return;

    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    const dx = e.clientX - startX.current;

    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      // Seuil atteint : dismiss avec animation de sortie
      setDismissing(true);
      setTranslateX(-window.innerWidth);
      // Laisser l'animation se terminer avant d'appeler onDismiss
      setTimeout(() => onDismiss(contentId), 280);
    } else {
      // Retour élastique
      setTranslateX(0);
    }

    setSwiping(false);
  }

  function handlePointerCancel(e: PointerEvent<HTMLDivElement>) {
    if (!swiping) return;
    try {
      ref.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setTranslateX(0);
    setSwiping(false);
  }

  const swipeProgress = Math.min(Math.abs(translateX) / SWIPE_THRESHOLD, 1);
  const showDanger = swipeProgress > 0.1;

  return (
    <div className={`group relative overflow-hidden ${className ?? ""}`}>
      {/* Indicateur de danger visible sous la carte pendant le swipe */}
      {showDanger && (
        <div
          className="absolute inset-0 flex items-center justify-end rounded-[var(--radius)] bg-danger/20 pr-4"
          aria-hidden
        >
          <X
            className="text-danger"
            style={{ opacity: swipeProgress, transform: `scale(${0.6 + swipeProgress * 0.4})` }}
          />
        </div>
      )}

      {/* Carte glissable */}
      <div
        ref={ref}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? "none" : "transform 0.28s cubic-bezier(0.25,0.8,0.25,1)",
          touchAction: "pan-y",
          userSelect: "none",
          willChange: dismissing ? "transform" : undefined,
        }}
        className="relative"
      >
        {children}

        {/* Bouton × desktop — visible au hover du groupe */}
        <button
          type="button"
          onClick={() => onDismiss(contentId)}
          aria-label={t("dismissAriaLabel")}
          // Décalé à gauche du bouton bookmark (lui en top-2 right-2) pour ne pas se chevaucher.
          className="absolute top-2 right-11 z-10 hidden rounded-full border border-border bg-surface/90 p-1 text-text-dim opacity-0 backdrop-blur-sm transition-opacity hover:text-text group-hover:opacity-100 lg:flex"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ONBOARDING_SLIDES } from "./onboarding-slides";
import { useFirstLaunch } from "./use-first-launch";

/** Événement global pour ré-ouvrir le tuto (« Revoir le tuto » d'Informations). */
export const ONBOARDING_REPLAY_EVENT = "athena:onboarding-replay";

/** Déclenche la ré-ouverture du tuto depuis n'importe où dans l'app. */
export function replayOnboarding(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ONBOARDING_REPLAY_EVENT));
  }
}

const SWIPE_THRESHOLD = 48;

/**
 * Overlay tuto premier lancement (Base UI Dialog) : 3 slides skippables,
 * pagination par dots, swipe horizontal (mobile) + flèches (desktop).
 * Sheet plein écran < lg, modale centrée ≥ lg. Pose le flag à la fermeture.
 * Monté une fois au niveau du shell ; ne se rend jamais SSR ouvert.
 */
export function OnboardingOverlay() {
  const { shouldShow, dismiss, replay } = useFirstLaunch();
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);

  const last = ONBOARDING_SLIDES.length - 1;
  const isLast = index === last;

  useEffect(() => {
    const onReplay = () => {
      setIndex(0);
      replay();
    };
    window.addEventListener(ONBOARDING_REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(ONBOARDING_REPLAY_EVENT, onReplay);
  }, [replay]);

  const close = useCallback(() => {
    dismiss();
    setIndex(0);
  }, [dismiss]);

  const next = useCallback(() => {
    setIndex((i) => (i >= last ? i : i + 1));
  }, [last]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  function onPointerDown(e: ReactPointerEvent) {
    startX.current = e.clientX;
  }
  function onPointerUp(e: ReactPointerEvent) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD) prev();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  }

  const slide = ONBOARDING_SLIDES[index];
  const Icon = slide.icon;

  return (
    <Dialog.Root
      open={shouldShow}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          onKeyDown={onKeyDown}
          aria-labelledby="onboarding-title"
          className={cn(
            "fixed z-50 flex flex-col bg-surface text-text shadow-elev-2 outline-none",
            // Mobile : sheet bas plein largeur, slide-up.
            "inset-x-0 bottom-0 rounded-t-[var(--radius-lg)] pb-[env(safe-area-inset-bottom)]",
            "transition-transform duration-[250ms] data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
            // Desktop : modale centrée, fade + scale.
            "lg:inset-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:w-[min(480px,calc(100vw-2rem))] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[var(--radius-lg)]",
            "lg:transition-[opacity,transform] lg:data-[starting-style]:translate-y-[-48%] lg:data-[starting-style]:scale-95 lg:data-[starting-style]:opacity-0 lg:data-[ending-style]:scale-95 lg:data-[ending-style]:opacity-0",
            "motion-reduce:transition-opacity motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:lg:data-[starting-style]:translate-y-[-50%]",
          )}
        >
          <div className="flex items-center justify-end px-4 pt-4">
            <Dialog.Close className="inline-flex h-9 items-center rounded-[var(--radius)] px-3.5 text-[13px] font-semibold text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text">
              Passer
            </Dialog.Close>
          </div>

          <div
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="flex flex-1 touch-pan-y flex-col items-center px-6 pb-2 pt-4 text-center"
            aria-live="polite"
          >
            <div className="grid size-16 place-items-center rounded-[18px] bg-primary/15 text-primary">
              <Icon className="size-8" />
            </div>
            <Dialog.Title
              id="onboarding-title"
              className="mt-5 font-display text-[20px] font-extrabold tracking-[-0.015em]"
            >
              {slide.title}
            </Dialog.Title>
            <Dialog.Description className="mt-2.5 max-w-[340px] text-[14.5px] text-text-dim">
              {slide.text}
            </Dialog.Description>
            <span className="sr-only">
              Slide {index + 1} sur {ONBOARDING_SLIDES.length}
            </span>
          </div>

          {/* Dots de pagination */}
          <div className="flex items-center justify-center gap-2 py-4">
            {ONBOARDING_SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Aller au slide ${i + 1} sur ${ONBOARDING_SLIDES.length}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "h-2 rounded-full transition-all duration-200 motion-reduce:transition-none",
                  i === index
                    ? "w-5 bg-primary"
                    : "w-2 bg-border hover:bg-text-faint",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 px-6 pb-6">
            {index > 0 ? (
              <Button
                variant="secondary"
                onClick={prev}
                aria-label="Slide précédent"
                className="shrink-0"
              >
                <ChevronLeft />
              </Button>
            ) : null}
            {isLast ? (
              <Button onClick={close} className="flex-1">
                Commencer
              </Button>
            ) : (
              <Button onClick={next} className="flex-1">
                Suivant
                <ChevronRight />
              </Button>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

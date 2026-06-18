"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

const AUTO_CLOSE_MS = 4000;

interface DismissToastProps {
  onUndo: () => void;
  onClose: () => void;
}

/**
 * Toast « Article masqué · Annuler » sans librairie.
 * Positionné en bas-centre, au-dessus de la tabbar mobile.
 * Auto-fermeture après 4 s.
 */
export function DismissToast({ onUndo, onClose }: DismissToastProps) {
  const t = useTranslations("feed");

  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+72px)] left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 shadow-elev-1 text-sm">
        <span className="text-text">{t("dismissed")}</span>
        <button
          type="button"
          onClick={() => {
            onUndo();
            onClose();
          }}
          className="font-semibold text-primary hover:underline"
        >
          {t("undoDismiss")}
        </button>
      </div>
    </div>
  );
}

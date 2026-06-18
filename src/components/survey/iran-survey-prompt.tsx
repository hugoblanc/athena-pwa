"use client";

import { Dialog } from "@base-ui/react/dialog";
import { Heart, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { getSurveyEligibility, submitSurveyFeedback } from "@/lib/api/survey";

/**
 * Sondage ciblé Iran. N'apparaît QUE pour les visiteurs géolocalisés en Iran
 * (éligibilité décidée côté serveur via geoip), une seule fois par appareil.
 *
 * Texte bilingue persan + anglais, indépendant de la langue d'IHM choisie :
 * le public visé doit comprendre même s'il n'a pas basculé en فارسی.
 * Monté une fois au niveau du layout, à côté de <UsageTracker />.
 *
 * TODO: relecture du persan par un locuteur natif avant un usage large.
 */

const STORAGE_KEY = "athena:iran-survey:v1";
const OPEN_DELAY_MS = 1500;
const MESSAGE_MAX = 2000;

const textareaClass =
  "min-h-[112px] w-full resize-y rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]";

const inputClass =
  "h-11 w-full rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 text-[15px] text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]";

function markSeen(value: "dismissed" | "done") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* stockage indisponible : au pire le sondage pourra réapparaître */
  }
}

export function IranSurveyPrompt() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Éligibilité : une seule fois par appareil, gated côté serveur (geoip Iran).
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Aperçu dev : `?surveyPreview=1` force l'ouverture (UI seulement, sans API
    // ni geoloc). Inactif en production.
    if (
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).has("surveyPreview")
    ) {
      setOpen(true);
      return;
    }

    let seen: string | null = null;
    try {
      seen = localStorage.getItem(STORAGE_KEY);
    } catch {
      seen = null;
    }
    if (seen) return;

    let cancelled = false;
    getSurveyEligibility("iran")
      .then((res) => {
        if (cancelled || !res.eligible) return;
        const t = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
        timers.current.push(t);
      })
      .catch(() => {
        /* best-effort : pas de sondage si l'API ne répond pas */
      });

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
    };
  }, []);

  function dismiss() {
    markSeen("dismissed");
    setOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      await submitSurveyFeedback({
        message: trimmed,
        contact: contact.trim() || undefined,
        // Locale d'IHM au moment de l'envoi, lue sur <html lang> (pas de
        // dépendance au provider next-intl : ce composant vit à la racine body).
        locale: document.documentElement.lang || undefined,
      });
      markSeen("done");
      setDone(true);
      const t = setTimeout(() => setOpen(false), 2200);
      timers.current.push(t);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        // Fermeture par clic backdrop / Échap = on n'embête plus l'utilisateur.
        if (!next && !done) markSeen("dismissed");
        setOpen(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          dir="rtl"
          aria-labelledby={titleId}
          className={cn(
            "fixed z-50 flex flex-col bg-surface text-text shadow-elev-2 outline-none",
            "inset-x-0 bottom-0 rounded-t-[var(--radius-lg)] pb-[max(20px,env(safe-area-inset-bottom))]",
            "transition-transform duration-[250ms] data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            "sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[min(480px,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[var(--radius-lg)]",
            "sm:transition-[opacity,transform] sm:data-[starting-style]:translate-y-[-48%] sm:data-[starting-style]:scale-95 sm:data-[starting-style]:opacity-0 sm:data-[ending-style]:scale-95 sm:data-[ending-style]:opacity-0",
            "motion-reduce:transition-opacity",
          )}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-primary/15 text-primary">
              <Heart className="size-6" />
            </div>
            <Dialog.Close
              aria-label="بستن"
              className="inline-flex size-9 items-center justify-center rounded-[var(--radius)] text-text-dim transition-colors duration-150 hover:bg-surface-2 hover:text-text"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          {done ? (
            <div className="px-5 pb-6 pt-3 text-center" aria-live="polite">
              <Dialog.Title
                id={titleId}
                className="font-display text-[20px] font-extrabold tracking-[-0.015em]"
              >
                ممنون! 🙏
              </Dialog.Title>
              <p className="mt-2 text-[14.5px] text-text-dim">
                پیام شما رسید. خیلی ممنون که کمک کردید.
                <br />
                <span className="text-text-faint">Thank you — your message was received.</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 pb-6 pt-3">
              <div>
                <Dialog.Title
                  id={titleId}
                  className="font-display text-[20px] font-extrabold tracking-[-0.015em]"
                >
                  مردم ایران، می‌بینم‌تان 👋
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-[14.5px] leading-relaxed text-text-dim">
                  من سازندهٔ آتنا هستم. می‌خواهم بفهمم دنبال چه هستید و چطور
                  می‌توانم بهتر کمکتان کنم. لطفاً همین‌جا برایم بنویسید.
                  <br />
                  <span className="text-text-faint" dir="ltr">
                    People of Iran — I see you. I make Athena and I’d love to understand what you’re looking for and how to help. Tell me here.
                  </span>
                </Dialog.Description>
              </div>

              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                  required
                  rows={4}
                  autoFocus
                  placeholder="دنبال چه محتوایی هستید؟ چه چیزی برایتان مفید است؟"
                  className={textareaClass}
                />
              </div>

              <div>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="ایمیل یا تلگرام (اختیاری) — Email or Telegram (optional)"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>

              {error && (
                <p className="text-[13.5px] text-danger" role="alert">
                  ارسال نشد، لطفاً دوباره تلاش کنید. — Sending failed, please retry.
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={dismiss}
                  className="shrink-0"
                >
                  بعداً
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || message.trim().length === 0}
                  className="flex-1"
                >
                  {submitting ? "در حال ارسال…" : "ارسال"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

"use client";

import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ui/share-button";
import { QaSourceList } from "./qa-source-list";
import type { QaExchange } from "./types";

/** Trois points animés pendant la « réflexion » (avant le 1er token). */
function ThinkingDots() {
  return (
    <span
      className="inline-flex items-center gap-1"
      aria-label="Athena réfléchit"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-text-faint"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Réponse copiée" : "Copier la réponse"}
      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[12.5px] font-semibold text-text-dim transition-colors hover:bg-surface-2 hover:text-text [&_svg]:size-4"
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

/**
 * Bulle d'un échange Q/R : question (alignée à droite) puis réponse Athena
 * streamée (caret clignotant), barre d'actions et états loading/error/done.
 */
export function QaMessage({
  exchange,
  onRetry,
}: {
  exchange: QaExchange;
  onRetry?: (question: string) => void;
}) {
  const { question, answer, sources, status, error } = exchange;
  const isStreaming = status === "streaming";
  const isAsking = status === "asking";
  const isError = status === "error";
  const isDone = status === "done";

  return (
    <article className="flex flex-col gap-3">
      {/* Question — alignée à droite, bulle teintée */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[var(--radius)] rounded-tr-[var(--radius-sm)] bg-surface-2 px-4 py-2.5 text-[15px] font-medium text-text">
          {question}
        </div>
      </div>

      {/* Réponse — alignée à gauche avec puce Sparkles */}
      <div className="flex gap-2.5">
        <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Sparkles className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="prose text-[15px] leading-relaxed"
            aria-live="polite"
            aria-busy={isAsking || isStreaming}
          >
            {isAsking && !answer ? (
              <ThinkingDots />
            ) : (
              <span className="whitespace-pre-wrap">
                {answer}
                {isStreaming && (
                  <span
                    className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-primary align-middle motion-reduce:animate-none"
                    aria-hidden
                  />
                )}
              </span>
            )}
          </div>

          {isError && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[var(--radius)] border border-danger/35 bg-danger/10 px-3 py-2 text-[13.5px] text-danger">
              <span>{error ?? "Une erreur est survenue."}</span>
              {onRetry && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRetry(question)}
                  className="ml-auto"
                >
                  <RotateCcw className="size-4" />
                  Réessayer
                </Button>
              )}
            </div>
          )}

          {isDone && sources.length > 0 && (
            <QaSourceList sources={sources} />
          )}

          {isDone && answer && (
            <div className="mt-2.5 flex items-center gap-1">
              <CopyButton text={answer} />
              <ShareButton
                data={{ title: "Réponse d'Athena", text: answer, url: typeof window !== "undefined" ? window.location.href : "" }}
                variant="button"
                label="Partager"
                tracking={{ refType: "qa", refId: "chat" }}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

"use client";

import { Plus } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IconButton } from "@/components/ui/button";
import { usePlayerStore } from "@/components/player/player-store";
import { cn } from "@/lib/cn";
import type { QaHistoryItem } from "@/lib/api/types";
import { QaComposer } from "./qa-composer";
import { QaHistoryPanel } from "./qa-history-panel";
import { QaMessage } from "./qa-message";
import { QaZeroState } from "./qa-zero-state";
import type { QaExchange } from "./types";
import { useQaStream } from "./use-qa-stream";

function historyToExchange(item: QaHistoryItem): QaExchange {
  return {
    id: item.id,
    question: item.question,
    answer: item.answer,
    sources: item.sources ?? [],
    status: "done",
    createdAt: item.createdAt,
  };
}

/**
 * Orchestrateur de l'écran QA : tient la liste des échanges (paires Q/R
 * indépendantes, QA mono-tour), branche le hook de stream, gère auto-scroll,
 * détection offline, historique et « nouvelle conversation ».
 */
export function QaConversation({
  initialHistory,
  initialHasNext,
}: {
  initialHistory: QaHistoryItem[];
  initialHasNext: boolean;
}) {
  const [exchanges, setExchanges] = useState<QaExchange[]>([]);
  const [offline, setOffline] = useState(false);
  const stream = useQaStream();

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const activeId = useRef<string | null>(null);

  const hasPlayer = usePlayerStore((s) => s.track !== null);

  // ── Détection offline ──────────────────────────────────────────────
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // ── Synchronise l'état du stream dans l'échange actif ───────────────
  useEffect(() => {
    const id = activeId.current;
    if (!id) return;
    setExchanges((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              answer: stream.answer,
              sources: stream.sources,
              status:
                stream.status === "asking"
                  ? "asking"
                  : stream.status === "streaming"
                    ? "streaming"
                    : stream.status === "error"
                      ? "error"
                      : "done",
              error: stream.error,
            }
          : ex,
      ),
    );
  }, [stream.answer, stream.sources, stream.status, stream.error]);

  // ── Auto-scroll « collé en bas » ────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [exchanges]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < 80;
  }, []);

  // ── Envoi d'une question ────────────────────────────────────────────
  const send = useCallback(
    (question: string) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `q-${Date.now()}`;
      activeId.current = id;
      stickToBottom.current = true;
      setExchanges((prev) => [
        ...prev,
        {
          id,
          question,
          answer: "",
          sources: [],
          status: "asking",
          createdAt: new Date().toISOString(),
        },
      ]);
      void stream.send(question);
    },
    [stream],
  );

  // « Réessayer » : remplace le dernier échange en erreur et relance.
  const retry = useCallback(
    (question: string) => {
      setExchanges((prev) => prev.filter((ex) => ex.id !== activeId.current));
      send(question);
    },
    [send],
  );

  const newConversation = useCallback(() => {
    stream.stop();
    activeId.current = null;
    setExchanges([]);
  }, [stream]);

  // Recharge un échange figé depuis l'historique (sans re-streamer).
  const loadFromHistory = useCallback(
    (item: QaHistoryItem) => {
      stream.stop();
      activeId.current = null;
      setExchanges([historyToExchange(item)]);
      stickToBottom.current = true;
    },
    [stream],
  );

  const busy = stream.status === "asking" || stream.status === "streaming";
  const isEmpty = exchanges.length === 0;

  // Offset bas du composer : au-dessus de la TabBar (+ mini-player si actif).
  const composerPad = hasPlayer
    ? "pb-[calc(150px+env(safe-area-inset-bottom))] lg:pb-[96px]"
    : "pb-[calc(96px+env(safe-area-inset-bottom))] lg:pb-[24px]";

  return (
    <div className="relative flex min-h-[calc(100dvh-56px)] flex-col lg:min-h-dvh">
      {/* Barre d'actions de l'écran */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-bg/85 px-4 py-2.5 backdrop-blur-sm lg:px-6">
        <h1 className="font-display text-[16px] font-extrabold tracking-[-0.01em]">
          Demander à Athena
        </h1>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <IconButton
              aria-label="Nouvelle conversation"
              className="size-9"
              onClick={newConversation}
            >
              <Plus />
            </IconButton>
          )}
          <QaHistoryPanel
            initialItems={initialHistory}
            initialHasNext={initialHasNext}
            onSelect={loadFromHistory}
          />
        </div>
      </div>

      {/* Fil de messages */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn("flex-1 overflow-y-auto", composerPad)}
      >
        {isEmpty ? (
          <QaZeroState onPick={send} />
        ) : (
          <div className="mx-auto flex max-w-[720px] flex-col gap-7 px-5 py-6">
            {exchanges.map((ex) => (
              <QaMessage key={ex.id} exchange={ex} onRetry={retry} />
            ))}
          </div>
        )}
      </div>

      {/* Composer sticky bas */}
      <div
        className={cn(
          "fixed inset-x-0 z-20 px-3 lg:absolute lg:left-0 lg:right-0 lg:px-0",
          hasPlayer
            ? "bottom-[calc(150px+env(safe-area-inset-bottom))]"
            : "bottom-[calc(80px+env(safe-area-inset-bottom))]",
          "lg:bottom-0 lg:pb-4",
        )}
      >
        <div className="mx-auto w-full max-w-[720px] lg:px-5">
          <QaComposer
            onSend={send}
            onStop={stream.stop}
            busy={busy}
            offline={offline}
          />
        </div>
      </div>
    </div>
  );
}

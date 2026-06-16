"use client";

import { useCallback, useRef, useState } from "react";
import {
  askQuestion,
  getQaResult,
  qaStreamUrl,
} from "@/lib/api/qa";
import type { QaSource, QaStreamEvent } from "@/lib/api/types";

/** Statut du cycle ask → stream → result d'une question. */
export type QaStreamStatus =
  | "idle"
  | "asking" // askQuestion en cours (avant jobId)
  | "streaming" // tokens en réception
  | "done"
  | "error";

export interface QaStreamState {
  status: QaStreamStatus;
  /** Réponse en cours de construction (concat des tokens). */
  answer: string;
  sources: QaSource[];
  error: string | null;
  jobId: string | null;
}

const INITIAL: QaStreamState = {
  status: "idle",
  answer: "",
  sources: [],
  error: null,
  jobId: null,
};

/**
 * Encapsule le cycle complet d'une réponse QA :
 * askQuestion → EventSource(qaStreamUrl) → parse QaStreamEvent → done.
 * Filet de sécurité : si le flux se ferme sans `done`, fallback getQaResult.
 */
export function useQaStream() {
  const [state, setState] = useState<QaStreamState>(INITIAL);
  const esRef = useRef<EventSource | null>(null);
  const answerRef = useRef("");
  const doneRef = useRef(false);

  const cleanup = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cleanup();
    answerRef.current = "";
    doneRef.current = false;
    setState(INITIAL);
  }, [cleanup]);

  /** Filet : récupère le résultat final si le flux a coupé sans `done`. */
  const fallbackResult = useCallback(async (jobId: string) => {
    try {
      const result = await getQaResult(jobId);
      doneRef.current = true;
      setState((s) => ({
        ...s,
        status: "done",
        answer: result.answer || answerRef.current,
        sources: result.sources ?? [],
        error: null,
      }));
    } catch {
      // Si même le filet échoue : on garde la réponse partielle si elle existe.
      setState((s) =>
        answerRef.current
          ? { ...s, status: "done" }
          : {
              ...s,
              status: "error",
              error: "La réponse n'a pas pu être récupérée. Réessaie.",
            },
      );
    }
  }, []);

  const send = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q) return;

      cleanup();
      answerRef.current = "";
      doneRef.current = false;
      setState({ ...INITIAL, status: "asking" });

      let jobId: string;
      try {
        const res = await askQuestion(q);
        jobId = res.jobId;
      } catch {
        setState((s) => ({
          ...s,
          status: "error",
          error: "Impossible d'envoyer la question.",
        }));
        return;
      }

      setState((s) => ({ ...s, status: "streaming", jobId }));

      const es = new EventSource(qaStreamUrl(jobId));
      esRef.current = es;

      es.onmessage = (e) => {
        let event: QaStreamEvent;
        try {
          event = JSON.parse(e.data) as QaStreamEvent;
        } catch {
          return; // ligne non-JSON (keep-alive) → ignorée
        }

        if (event.type === "token") {
          answerRef.current += event.content;
          const next = answerRef.current;
          setState((s) => ({ ...s, status: "streaming", answer: next }));
        } else if (event.type === "done") {
          doneRef.current = true;
          cleanup();
          setState((s) => ({
            ...s,
            status: "done",
            sources: event.sources ?? s.sources,
          }));
        } else if (event.type === "error") {
          doneRef.current = true;
          cleanup();
          setState((s) => ({
            ...s,
            status: "error",
            error: event.error || "Une erreur est survenue.",
          }));
        }
      };

      // Drop réseau / fermeture sans `done` → filet getQaResult.
      es.onerror = () => {
        cleanup();
        if (!doneRef.current) {
          void fallbackResult(jobId);
        }
      };
    },
    [cleanup, fallbackResult],
  );

  /** Interrompt le flux ; la réponse partielle reste figée. */
  const stop = useCallback(() => {
    doneRef.current = true;
    cleanup();
    setState((s) => ({ ...s, status: s.answer ? "done" : "idle" }));
  }, [cleanup]);

  return { ...state, send, stop, reset } as const;
}

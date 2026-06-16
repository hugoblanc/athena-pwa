import type { QaSource } from "@/lib/api/types";

/** État d'un échange Q/R affiché dans la conversation. */
export type QaExchangeStatus =
  | "asking" // question envoyée, en attente du 1er token
  | "streaming" // réponse en cours
  | "done"
  | "error";

/** Un échange = une paire question / réponse (QA mono-tour). */
export interface QaExchange {
  /** id local (jobId une fois connu, sinon clé temporaire). */
  id: string;
  question: string;
  answer: string;
  sources: QaSource[];
  status: QaExchangeStatus;
  error?: string | null;
  createdAt: string;
}

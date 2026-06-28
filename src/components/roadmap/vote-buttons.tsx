"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  clapIssue,
  downvoteIssue,
  removeDownvote,
  unclapIssue,
} from "@/lib/api/roadmap";
import type { Issue } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const UP_KEY = "athena:clapped-issues";
const DOWN_KEY = "athena:downvoted-issues";

/** -1 (contre) · 0 (neutre) · 1 (pour) */
type Vote = -1 | 0 | 1;

function readSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, ids: Set<number>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* quota / mode privé : feedback cosmétique, on ignore */
  }
}

/** Lit le vote local persisté pour une idée (contre prioritaire sur pour). */
function readVote(issueId: number): Vote {
  if (readSet(DOWN_KEY).has(issueId)) return -1;
  if (readSet(UP_KEY).has(issueId)) return 1;
  return 0;
}

/** Persiste le vote en maintenant l'exclusivité mutuelle pour/contre. */
function persistVote(issueId: number, vote: Vote) {
  const up = readSet(UP_KEY);
  const down = readSet(DOWN_KEY);
  up.delete(issueId);
  down.delete(issueId);
  if (vote === 1) up.add(issueId);
  if (vote === -1) down.add(issueId);
  writeSet(UP_KEY, up);
  writeSet(DOWN_KEY, down);
}

/**
 * Boutons de vote d'une idée : pouce haut (clap anonyme) + pouce bas (downvote,
 * connexion requise), mutuellement exclusifs. Compteur NET affiché, mises à jour
 * optimistes avec rollback. Le pouce bas non connecté redirige vers la connexion.
 *
 * `count` doit être le score net (`voteCount`), tel que renvoyé par l'API ; il
 * inclut déjà le vote courant de l'utilisateur s'il en a un (lu en localStorage).
 */
export function VoteButtons({
  issueId,
  count,
  title,
}: {
  issueId: number;
  count: number;
  title: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [vote, setVote] = useState<Vote>(0);
  const [score, setScore] = useState(count);
  const [pending, setPending] = useState(false);

  // Hydratation : `count` inclut déjà le vote persisté → on ne touche PAS au
  // score, seulement à l'état visuel (évite toute dérive pour/contre).
  useEffect(() => {
    setVote(readVote(issueId));
  }, [issueId]);

  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const disabled = pending || offline;

  /** Opérations serveur pour passer de `from` à `to`. */
  async function applyServer(from: Vote, to: Vote): Promise<Issue | undefined> {
    let last: Issue | undefined;
    if (from === 1 && to !== 1) last = await unclapIssue(issueId);
    if (from === -1 && to !== -1) last = await removeDownvote(issueId);
    if (to === 1 && from !== 1) last = await clapIssue(issueId);
    if (to === -1 && from !== -1) last = await downvoteIssue(issueId);
    return last;
  }

  async function transition(to: Vote) {
    if (disabled) return;
    const from = vote;
    if (from === to) return;

    // Le downvote exige un compte : on redirige vers la connexion.
    if (to === -1 && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setPending(true);
    // Optimiste : le vote contribue au net par sa valeur (−1/0/1).
    setVote(to);
    setScore((s) => s + (to - from));
    persistVote(issueId, to);

    try {
      const res = await applyServer(from, to);
      // Réconcilie sur le net serveur quand il est fourni.
      if (typeof res?.voteCount === "number") setScore(res.voteCount);
    } catch {
      // rollback complet
      setVote(from);
      setScore((s) => s - (to - from));
      persistVote(issueId, from);
    } finally {
      setPending(false);
    }
  }

  const upActive = vote === 1;
  const downActive = vote === -1;

  return (
    <div
      role="group"
      aria-label={`Voter : ${title}`}
      className="inline-flex shrink-0 items-center rounded-full border border-border bg-surface-2"
    >
      <button
        type="button"
        onClick={() => transition(upActive ? 0 : 1)}
        disabled={disabled}
        aria-pressed={upActive}
        aria-label={`${upActive ? "Retirer mon vote pour" : "Voter pour"} : ${title}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-l-full py-1.5 pl-3 pr-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed",
          upActive
            ? "text-tag-text-orange"
            : "text-text-dim hover:text-text",
        )}
      >
        <ThumbsUp
          className={cn("size-[15px]", upActive && "fill-current")}
          aria-hidden
        />
        <span aria-live="polite">{score}</span>
      </button>

      <span aria-hidden className="h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => transition(downActive ? 0 : -1)}
        disabled={disabled}
        aria-pressed={downActive}
        aria-label={`${downActive ? "Retirer mon vote contre" : "Voter contre"} : ${title}`}
        className={cn(
          "inline-flex items-center rounded-r-full px-2.5 py-1.5 transition-colors disabled:cursor-not-allowed",
          downActive ? "text-danger" : "text-text-dim hover:text-text",
        )}
      >
        <ThumbsDown
          className={cn("size-[15px]", downActive && "fill-current")}
          aria-hidden
        />
      </button>
    </div>
  );
}

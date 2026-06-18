"use client";

import { ThumbsUp } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { clapIssue, unclapIssue } from "@/lib/api/roadmap";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "athena:clapped-issues";

function readClapped(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set<number>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistClapped(ids: Set<number>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* quota / private mode — feedback purement cosmétique, on ignore */
  }
}

// ── Store externe minimal pour synchroniser l'état « déjà voté » (localStorage)
// sans setState-dans-un-effet. Hydration-safe via le snapshot serveur (= false).
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", cb);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", cb);
    }
  };
}

/**
 * Pastille de vote « clap » avec incrément optimiste, anti-double-vote local
 * (localStorage) et rollback en cas d'échec réseau.
 *
 * ⚠️ Non monté en v1 (pas de liste in-app, cf. roadmap.ts). Prêt à l'emploi
 * dès que `listIssues()` sera branché.
 */
export function ClapButton({
  issueId,
  count,
  title,
}: {
  issueId: number;
  count: number;
  title: string;
}) {
  const voted = useSyncExternalStore(
    subscribe,
    () => readClapped().has(issueId),
    () => false, // snapshot serveur : jamais voté avant hydratation
  );
  const [pending, setPending] = useState(false);

  // État « voté » au chargement : `count` (serveur) inclut DÉJÀ le vote de
  // l'utilisateur s'il avait voté. On calcule donc la valeur affichée
  // relativement à cet état initial (et pas un simple ±1), sinon le compteur
  // dérive après un vote→dévote.
  const [votedInitial, setVotedInitial] = useState<boolean | null>(null);
  useEffect(() => {
    setVotedInitial(readClapped().has(issueId));
  }, [issueId]);

  const baseVoted = votedInitial ?? voted;
  const value = count + (voted ? 1 : 0) - (baseVoted ? 1 : 0);

  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const disabled = pending || offline;

  /** Toggle : un re-clic retire le vote. Optimiste + rollback en cas d'échec. */
  async function handleToggle() {
    if (disabled) return;
    const wasVoted = readClapped().has(issueId);
    setPending(true);

    const next = readClapped();
    if (wasVoted) next.delete(issueId);
    else next.add(issueId);
    persistClapped(next);
    emit();

    try {
      if (wasVoted) await unclapIssue(issueId);
      else await clapIssue(issueId);
    } catch {
      // rollback
      const rolled = readClapped();
      if (wasVoted) rolled.add(issueId);
      else rolled.delete(issueId);
      persistClapped(rolled);
      emit();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={`${voted ? "Retirer le vote" : "Voter"} : ${title} — ${value} vote${value > 1 ? "s" : ""}`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-[background,border-color,color] duration-150 disabled:cursor-not-allowed",
        voted
          ? "border-primary bg-primary/15 text-tag-text-orange"
          : "border-border bg-surface-2 text-text-dim hover:border-text-faint hover:text-text",
      )}
    >
      <ThumbsUp
        className={cn("size-[15px]", voted && "fill-current")}
        aria-hidden
      />
      <span aria-live="polite">{value}</span>
    </button>
  );
}

"use client";

import { ThumbsUp } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { clapIssue } from "@/lib/api/roadmap";
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
  const [delta, setDelta] = useState(0);
  const [pending, setPending] = useState(false);

  const value = count + delta;
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  const disabled = voted || pending || offline;

  async function handleClap() {
    if (disabled) return;
    setPending(true);
    setDelta(1);
    const clapped = readClapped();
    clapped.add(issueId);
    persistClapped(clapped);
    emit();

    try {
      await clapIssue(issueId);
    } catch {
      // rollback
      setDelta(0);
      const rolled = readClapped();
      rolled.delete(issueId);
      persistClapped(rolled);
      emit();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClap}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={`Voter pour : ${title} — ${value} vote${value > 1 ? "s" : ""}`}
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

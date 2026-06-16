"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

/**
 * Sentinelle de défilement infini (IntersectionObserver) avec fallback bouton
 * « Charger plus » accessible. Standard de pagination transverse.
 */
export function InfiniteSentinel({
  onLoadMore,
  hasNext,
  loading,
}: {
  onLoadMore: () => void;
  hasNext: boolean;
  loading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNext || loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNext, loading, onLoadMore]);

  if (!hasNext) return null;

  return (
    <div ref={ref} className="flex justify-center py-6">
      <Button variant="secondary" onClick={onLoadMore} disabled={loading}>
        {loading ? "Chargement…" : "Charger plus"}
      </Button>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackFeature } from "@/lib/analytics";
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

  // Mesure d'engagement : on compte chaque chargement de page suivante.
  const loadMore = useCallback(() => {
    trackFeature("load_more");
    onLoadMore();
  }, [onLoadMore]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasNext || loading) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNext, loading, loadMore]);

  if (!hasNext) return null;

  return (
    <div ref={ref} className="flex justify-center py-6">
      <Button variant="secondary" onClick={loadMore} disabled={loading}>
        {loading ? "Chargement…" : "Charger plus"}
      </Button>
    </div>
  );
}

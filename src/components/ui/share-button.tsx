"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { track, trackFeature } from "@/lib/analytics";
import type { ShareRef, ShareRefType } from "@/lib/site";
import { Button, IconButton } from "./button";

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/** Métadonnées d'attribution : si fournies, un `reshare` est émis au partage. */
export interface ShareTracking {
  refType: ShareRefType;
  refId: string;
  ref?: ShareRef;
}

/**
 * Bouton de partage global : Web Share API native (mobile) avec fallback
 * copie-lien (desktop). Unique pour toute l'app (pas de doublon par domaine).
 * Émet un événement `reshare` si `tracking` est fourni — c'est le numérateur
 * du k-factor de la growth loop.
 */
export function ShareButton({
  data,
  variant = "icon",
  label = "Partager",
  tracking,
}: {
  data: ShareData;
  variant?: "icon" | "button";
  label?: string;
  tracking?: ShareTracking;
}) {
  const [copied, setCopied] = useState(false);

  function emit() {
    // Usage produit : on compte tout partage réussi (avec ou sans attribution).
    trackFeature("share_open");
    if (tracking)
      track("reshare", {
        refType: tracking.refType,
        refId: tracking.refId,
        ref: tracking.ref ?? "app",
      });
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        emit();
        return;
      } catch {
        /* annulé ou non supporté → fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(data.url);
      emit();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  const icon = copied ? <Check className="text-success" /> : <Share2 />;

  if (variant === "icon") {
    return (
      <IconButton aria-label={label} onClick={share}>
        {icon}
      </IconButton>
    );
  }
  return (
    <Button variant="secondary" onClick={share}>
      {icon}
      {copied ? "Lien copié" : label}
    </Button>
  );
}

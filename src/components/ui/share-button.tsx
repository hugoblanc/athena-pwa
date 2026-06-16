"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button, IconButton } from "./button";

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

/**
 * Bouton de partage global : Web Share API native (mobile) avec fallback
 * copie-lien (desktop). Unique pour toute l'app (pas de doublon par domaine).
 */
export function ShareButton({
  data,
  variant = "icon",
  label = "Partager",
}: {
  data: ShareData;
  variant?: "icon" | "button";
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* annulé ou non supporté → fallback */
      }
    }
    try {
      await navigator.clipboard.writeText(data.url);
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

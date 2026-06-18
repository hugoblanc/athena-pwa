"use client";

import { Mail, MessageCircle, Send, Share2 } from "lucide-react";
import { track } from "@/lib/analytics";
import { buildShareUrl, type ShareRef, type ShareRefType } from "@/lib/site";

/**
 * Boutons de re-partage pré-remplis multi-canaux (la conversion PRIMAIRE de la
 * growth loop). Ce sont de simples liens → fonctionnent même dans les
 * navigateurs in-app (WhatsApp/Instagram) où `navigator.share` peut manquer.
 * Chaque canal porte son `?ref` pour l'attribution et émet un `reshare`.
 */
export function ShareIntents({
  path,
  title,
  source,
  refType,
  refId,
}: {
  /** Chemin canonique de la ressource (via `sharePath.*`). */
  path: string;
  title: string;
  /** Média source (ex. « Blast »). Crédité dans le message si présent. */
  source?: string;
  refType: ShareRefType;
  refId: string;
}) {
  function intent(ref: ShareRef): { url: string; text: string } {
    const url = buildShareUrl(path, ref);
    // Le crédit au média (« via … ») valorise la source et donne une raison de
    // cliquer ; la signature dit ce qu'est Athena à qui ne connaît pas.
    const credit = source ? ` — via ${source}` : "";
    return { url, text: `${title}${credit}, à suivre sur Athena` };
  }

  function onShare(channel: ShareRef, href: string) {
    track("reshare", { refType, refId, ref: channel });
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const wa = intent("whatsapp");
  const tg = intent("telegram");
  const x = intent("x");
  const ml = intent("mailto");

  const channels: {
    key: ShareRef;
    label: string;
    icon: typeof MessageCircle;
    href: string;
  }[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${wa.text} ${wa.url}`)}`,
    },
    {
      key: "telegram",
      label: "Telegram",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(tg.url)}&text=${encodeURIComponent(tg.text)}`,
    },
    {
      key: "x",
      label: "X",
      icon: Share2,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(x.text)}&url=${encodeURIComponent(x.url)}`,
    },
    {
      key: "mailto",
      label: "E-mail",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${ml.text}\n\n${ml.url}`)}`,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {channels.map(({ key, label, icon: Icon, href }) => (
        <button
          key={key}
          type="button"
          onClick={() => onShare(key, href)}
          className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold text-text transition-colors hover:border-primary hover:text-primary"
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

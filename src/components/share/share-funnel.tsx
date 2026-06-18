"use client";

import { ArrowRight, BellRing } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShareIntents } from "@/components/share/share-intents";
import { useValueReached } from "@/components/share/use-value-reached";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { isStandalone } from "@/lib/pwa";
import type { ShareRefType } from "@/lib/site";

/**
 * Sous la preview de partage. Philosophie : **ne pas frustrer le lecteur**. La
 * lecture est l'action primaire (bouton « Lire l'article » dans la carte, cf.
 * `SharePreview`). Ici, en dessous, on propose l'install comme *upgrade* via une
 * accroche courte, sans bloquer l'accès au contenu. Le bouton mène à la page
 * guide dédiée `/installer`.
 *
 * Mesure : `preview_view` à l'arrivée, `value_reached` quand la valeur est reçue
 * (révèle le re-partage = numérateur du k-factor).
 */
export function ShareFunnel({
  refType,
  refId,
  sharePath,
  title,
  source,
}: {
  refType: ShareRefType;
  refId: string;
  /** Chemin canonique de la ressource (via `sharePath.*`). */
  sharePath: string;
  title: string;
  /** Média source, crédité dans le message de re-partage. */
  source?: string;
}) {
  const { reached } = useValueReached();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    track("preview_view", { refType, refId, ref: "landing" });
    setStandalone(isStandalone());
  }, [refType, refId]);

  useEffect(() => {
    if (reached) track("value_reached", { refType, refId, ref: "landing" });
  }, [reached, refType, refId]);

  return (
    <section className="mt-3 flex flex-col gap-3">
      {/* Pitch install — proposé en douceur, jamais bloquant. Masqué si l'app
          est déjà installée (on est alors déjà dans la PWA). */}
      {!standalone && (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-[18px] shadow-elev-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[11px] bg-primary/15 text-primary">
              <BellRing className="size-[18px]" />
            </span>
            <p className="text-[13.5px] leading-relaxed text-text-dim">
              Vous pouvez lire cet article et oublier l&apos;existence
              d&apos;Athena. Ou{" "}
              <strong className="font-semibold text-text">
                installer l&apos;app
              </strong>{" "}
              pour suivre les médias indépendants et recevoir une notification à
              chaque nouvel article du genre.
            </p>
          </div>
          <Button
            render={<Link href="/installer" />}
            variant="secondary"
            className="mt-3.5 w-full"
          >
            Installer Athena
            <ArrowRight />
          </Button>
        </div>
      )}

      {/* k-factor : re-partage révélé APRÈS la valeur reçue. */}
      {reached && (
        <div className="rounded-[var(--radius)] border border-border bg-surface p-[18px] shadow-elev-1">
          <h2 className="font-display text-[15px] font-bold">
            Partagez à votre tour
          </h2>
          <p className="mb-3 mt-1.5 text-[13px] text-text-dim">
            Cette info mérite mieux que les algorithmes. Envoyez-la à ceux que ça
            concerne.
          </p>
          <ShareIntents
            path={sharePath}
            title={title}
            source={source}
            refType={refType}
            refId={refId}
          />
        </div>
      )}
    </section>
  );
}

"use client";

import { BellRing, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  enableAndFollow,
  getFollowedKeys,
  isPushSupported,
  unfollowMedia,
} from "@/lib/api/push";
import { cn } from "@/lib/cn";
import { isIOS, isStandalone } from "@/lib/pwa";

/**
 * Bouton « Suivre [Média] » : abonne aux notifications de ce média précis
 * (ciblage tranche 2). Au 1er suivi, déclenche l'abonnement push (+ permission).
 * Sur iOS non installé, redirige vers le guide d'installation (prérequis push iOS).
 */
export function FollowMediaButton({
  mediaKey,
  mediaTitle,
  className,
}: {
  mediaKey: string;
  mediaTitle?: string;
  className?: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setFollowing(getFollowedKeys().has(mediaKey));
  }, [mediaKey]);

  async function handleClick() {
    if (pending) return;

    if (following) {
      setPending(true);
      setFollowing(false);
      try {
        await unfollowMedia(mediaKey);
      } catch {
        setFollowing(true); // rollback
      } finally {
        setPending(false);
      }
      return;
    }

    // 1er suivi : iOS non installé → push impossible, on guide vers l'install.
    if ((isIOS() && !isStandalone()) || !isPushSupported()) {
      router.push("/installer");
      return;
    }

    setPending(true);
    setFollowing(true);
    try {
      await enableAndFollow(mediaKey); // permission + abonnement + suivi
    } catch {
      setFollowing(false); // refus de permission / échec
    } finally {
      setPending(false);
    }
  }

  const label = mediaTitle ? `Suivre ${mediaTitle}` : "Suivre";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={following}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        following
          ? "border-primary bg-primary/15 text-tag-text-orange"
          : "border-border bg-surface-2 text-text-dim hover:border-text-faint hover:text-text",
        className,
      )}
    >
      {following ? (
        <>
          <Check className="size-[15px]" aria-hidden />
          Suivi
        </>
      ) : (
        <>
          <BellRing className="size-[15px]" aria-hidden />
          {label}
        </>
      )}
    </button>
  );
}

"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

/** Bouton de déconnexion avec confirmation (Base UI AlertDialog). */
export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  async function handleSignOut() {
    setPending(true);
    try {
      await signOut();
      router.replace("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger
        render={
          <Button variant="danger" className="w-full">
            <LogOut />
            {t("signOut")}
          </Button>
        }
      />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-40px)] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-elev-2 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 transition-[transform,opacity]">
          <AlertDialog.Title className="font-display text-[18px] font-extrabold tracking-[-0.01em]">
            {t("signOutConfirmTitle")}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm text-text-dim">
            {t("signOutConfirmBody")}
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2.5">
            <AlertDialog.Close
              render={
                <Button variant="ghost" size="sm">
                  {tc("cancel")}
                </Button>
              }
            />
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              aria-busy={pending}
              onClick={handleSignOut}
            >
              {pending ? t("signOutPending") : t("signOut")}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

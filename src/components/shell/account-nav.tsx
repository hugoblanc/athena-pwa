"use client";

import { LogIn, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

function loginHref(pathname: string): string {
  return `/login?redirect=${encodeURIComponent(pathname || "/")}`;
}

function displayName(
  user: { displayName: string | null; email: string | null } | null,
): string {
  return user?.displayName?.trim() || user?.email || "Mon compte";
}

/**
 * Bloc compte pour la sidebar desktop (pleine largeur, en bas).
 * Connecté → avatar + nom (lien profil) ; sinon → bouton « Se connecter ».
 * Rend un placeholder stable tant que l'état Firebase n'est pas résolu
 * (évite tout saut / mismatch d'hydratation).
 */
export function AccountNav({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className={cn("h-[54px]", className)} aria-hidden />;
  }

  if (user) {
    const name = displayName(user);
    return (
      <Link
        href="/profile"
        aria-current={pathname.startsWith("/profile") ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-[11px] px-[10px] py-2.5 transition-colors hover:bg-surface-2",
          className,
        )}
      >
        <Avatar src={user.photoURL} name={name} size={34} />
        <span className="min-w-0">
          <span className="block truncate text-[14px] font-semibold">
            {name}
          </span>
          <span className="block text-[12px] text-text-dim">Voir le profil</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={loginHref(pathname)}
      className={cn(
        "flex items-center gap-[13px] rounded-[11px] border border-border bg-surface-2 px-[14px] py-[11px] text-[14.5px] font-semibold text-text transition-colors hover:border-primary",
        className,
      )}
    >
      <LogIn className="size-[19px] shrink-0" strokeWidth={2} />
      Se connecter
    </Link>
  );
}

/**
 * Bouton compte compact pour la top bar mobile.
 * Connecté → avatar (lien profil) ; sinon → icône « Se connecter ».
 */
export function AccountButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <span className="size-9" aria-hidden />;
  }

  if (user) {
    const name = displayName(user);
    return (
      <Link
        href="/profile"
        aria-label="Mon compte"
        className="grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Avatar src={user.photoURL} name={name} size={30} />
      </Link>
    );
  }

  return (
    <Link
      href={loginHref(pathname)}
      aria-label="Se connecter"
      className="grid size-9 place-items-center rounded-full text-text-dim transition-colors hover:bg-surface-2 hover:text-text"
    >
      <UserIcon className="size-[19px]" />
    </Link>
  );
}

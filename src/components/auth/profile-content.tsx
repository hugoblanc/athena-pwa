"use client";

import { Bell, FileText, Info, Map, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleSwitcherRow } from "@/components/i18n/locale-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { getMe } from "@/lib/api/user";
import type { UserProfile } from "@/lib/api/types";
import { useAuth } from "@/components/providers/auth-provider";
import { ProfileCard, type ProfileIdentity } from "./profile-card";
import {
  SettingsLinkRow,
  SettingsList,
} from "./settings-list";
import { SignOutButton } from "./sign-out-button";
import { ThemeToggleRow } from "./theme-toggle-row";

/** Hub /profile : identité + réglages + déconnexion. 100 % client (état Firebase). */
export function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("profile");
  const tc = useTranslations("common");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [meLoading, setMeLoading] = useState(true);

  // Redirect client si déconnecté (pas de middleware SSR).
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  // getMe() à la volée au montage (profil serveur). Fallback sur l'identité Firebase.
  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    getMe()
      .then((p) => {
        if (!active) return;
        setProfile(p);
        setProfileError(false);
      })
      .catch(() => active && setProfileError(true))
      .finally(() => active && setMeLoading(false));
    return () => {
      active = false;
    };
  }, [loading, user]);

  if (loading || !user) {
    return <ProfileSkeleton />;
  }

  // Identité : priorité au profil serveur, repli sur l'identité Firebase.
  const identity: ProfileIdentity = {
    displayName: profile?.displayName ?? user.displayName,
    email: profile?.email ?? user.email,
    photoUrl: profile?.photoUrl ?? user.photoURL,
    provider: profile?.provider ?? user.providerData[0]?.providerId,
  };

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <h1 className="mb-5 font-display text-[28px] font-extrabold tracking-[-0.02em]">
        {t("title")}
      </h1>

      {meLoading ? (
        <Skeleton className="h-[98px] w-full rounded-[var(--radius-lg)]" />
      ) : (
        <ProfileCard identity={identity} />
      )}

      {profileError && (
        <p
          role="alert"
          className="mt-3 rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] text-text-dim"
        >
          {t("serverError")}
        </p>
      )}

      <h2 className="mb-2.5 mt-7 text-[13px] font-bold uppercase tracking-[0.06em] text-text-dim">
        {t("sectionSettings")}
      </h2>
      <SettingsList>
        <SettingsLinkRow
          icon={Bell}
          label={t("notifPrefs")}
          href="/profile/notifications"
        />
        <ThemeToggleRow />
        <LocaleSwitcherRow label={tc("language")} />
      </SettingsList>

      <h2 className="mb-2.5 mt-7 text-[13px] font-bold uppercase tracking-[0.06em] text-text-dim">
        {t("sectionAbout")}
      </h2>
      <SettingsList>
        <SettingsLinkRow icon={Map} label={t("roadmap")} href="/roadmap" />
        <SettingsLinkRow icon={Info} label={t("about")} href="/about" />
        <SettingsLinkRow
          icon={ShieldCheck}
          label={t("privacy")}
          href="/privacy"
        />
        <SettingsLinkRow
          icon={FileText}
          label={t("terms")}
          href="/terms"
        />
      </SettingsList>

      <div className="mt-7">
        <SignOutButton />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[640px] px-5 pt-4 lg:pt-6">
      <Skeleton className="mb-5 h-8 w-32" />
      <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="mb-2.5 mt-7 h-4 w-24" />
      <div className="space-y-px rounded-[var(--radius-lg)] border border-border bg-surface p-1">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  );
}

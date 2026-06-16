import { Suspense } from "react";
import { Brand } from "@/components/shell/brand";
import { AuthForm } from "./auth-form";

/**
 * Écran plein centré pour /login et /register.
 * Mobile : pleine largeur, gouttière 20 px, centré verticalement.
 * Desktop : carte `max-w-[420px]` sur fond `--bg`.
 */
export function AuthScreen({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="flex min-h-[calc(100dvh-160px)] flex-col items-center justify-center px-5 py-10 lg:min-h-[calc(100dvh-88px)]">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-elev-2 lg:p-7">
          <Suspense fallback={<AuthFormFallback />}>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Squelette minimal pendant la résolution des searchParams (CSR bailout). */
function AuthFormFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto h-7 w-40 animate-pulse rounded bg-surface-2" />
      <div className="h-[42px] w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />
      <div className="h-11 w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />
      <div className="h-11 w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />
      <div className="h-[42px] w-full animate-pulse rounded-[var(--radius)] bg-surface-2" />
    </div>
  );
}

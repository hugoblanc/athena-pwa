"use client";

import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/text-field";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/providers/auth-provider";
import {
  isSilentAuthError,
  mapAuthError,
} from "./auth-errors";
import { GoogleButton } from "./google-button";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "Bon retour",
    subtitle: "Connectez-vous pour retrouver vos préférences.",
    submit: "Se connecter",
    pending: "Connexion…",
    switchPrompt: "Pas encore de compte ?",
    switchLabel: "Créer un compte",
    switchHref: "/register",
  },
  register: {
    title: "Créer un compte",
    subtitle: "Pour activer les notifications et l'historique de vos questions.",
    submit: "Créer mon compte",
    pending: "Création…",
    switchPrompt: "Déjà inscrit ?",
    switchLabel: "Se connecter",
    switchHref: "/login",
  },
} as const;

/**
 * Formulaire d'authentification partagé login/register.
 * Google en action primaire, email/mot de passe en repli.
 * Mode invité : lien « Continuer sans compte » → renvoie au Fil.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { signInWithGoogle, signInWithEmail, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Conserve le `redirect` lors de la bascule login ↔ register.
  const switchHref = redirect
    ? `${copy.switchHref}?redirect=${encodeURIComponent(redirect)}`
    : copy.switchHref;

  function goAfterAuth() {
    router.replace(redirect);
  }

  async function handleGoogle() {
    setError(null);
    setResetMsg(null);
    setPending(true);
    try {
      await signInWithGoogle();
      goAfterAuth();
    } catch (e) {
      if (!isSilentAuthError(e)) setError(mapAuthError(e));
      setPending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResetMsg(null);
    if (!navigator.onLine) {
      setError("Connexion impossible, vérifiez votre réseau.");
      return;
    }
    setPending(true);
    try {
      if (mode === "register") {
        await register(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      goAfterAuth();
    } catch (err) {
      setError(mapAuthError(err));
      setPending(false);
    }
  }

  async function handleReset() {
    setError(null);
    setResetMsg(null);
    if (!email.trim()) {
      setError("Saisissez votre email puis cliquez sur « Mot de passe oublié ».");
      return;
    }
    if (!auth) {
      setError("Authentification non disponible pour le moment.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetMsg(
        "Un email de réinitialisation vous a été envoyé si ce compte existe.",
      );
    } catch (err) {
      setError(mapAuthError(err));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="text-center">
        <h1 className="font-display text-[26px] font-extrabold tracking-[-0.02em]">
          {copy.title}
        </h1>
        <p className="mt-1.5 text-sm text-text-dim">{copy.subtitle}</p>
      </header>

      <GoogleButton onClick={handleGoogle} disabled={pending} />

      <div className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-faint">
        <span className="h-px flex-1 bg-border" />
        ou
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
        />

        <div className="flex flex-col gap-1.5">
          <PasswordField
            label="Mot de passe"
            name="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
          {mode === "login" && (
            <button
              type="button"
              onClick={handleReset}
              disabled={pending}
              className="self-end text-[12px] font-semibold text-text-dim hover:text-text disabled:opacity-45"
            >
              Mot de passe oublié ?
            </button>
          )}
        </div>

        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-[var(--radius)] border border-danger/35 bg-danger/10 px-3.5 py-2.5 text-[13px] text-danger"
          >
            {error}
          </p>
        )}
        {resetMsg && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-[var(--radius)] border border-border bg-surface-2 px-3.5 py-2.5 text-[13px] text-text-dim"
          >
            {resetMsg}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="w-full"
        >
          {pending ? copy.pending : copy.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-text-dim">
        {copy.switchPrompt}{" "}
        <Link
          href={switchHref}
          className="font-semibold text-primary hover:underline"
        >
          {copy.switchLabel}
        </Link>
      </p>

      <Link
        href="/"
        className="text-center text-[13px] text-text-faint hover:text-text-dim"
      >
        Continuer sans compte
      </Link>
    </div>
  );
}

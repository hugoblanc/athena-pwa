"use client";

import { authFetch } from "./auth-client";
import type { UserProfile } from "./types";

/** Profil de l'utilisateur connecté. `GET /auth/me` (Bearer Firebase) */
export function getMe(): Promise<UserProfile> {
  return authFetch<UserProfile>("/auth/me");
}

/**
 * Préférences utilisateur (forme libre côté API). `GET /auth/preferences`
 * Cible pour stocker les préférences de notification par média/catégorie.
 */
export function getPreferences(): Promise<Record<string, unknown>> {
  return authFetch<Record<string, unknown>>("/auth/preferences");
}

/** MAJ partielle des préférences. `PUT /auth/preferences` */
export function updatePreferences(
  partial: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return authFetch<Record<string, unknown>>("/auth/preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
}

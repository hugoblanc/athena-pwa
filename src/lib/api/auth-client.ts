"use client";

import { auth } from "@/lib/firebase";
import { ApiError, type RequestOptions } from "./client";
import { API_BASE_URL } from "./config";

/**
 * Fetch authentifié (CLIENT only) vers les endpoints protégés `/auth/*`.
 * Reprend le comportement de l'AuthInterceptor Angular : injecte le Bearer
 * Firebase, et retry une fois sur 401 avec un token rafraîchi.
 */
export async function authFetch<T>(
  path: string,
  { query, ...init }: RequestOptions = {},
): Promise<T> {
  const user = auth?.currentUser;
  if (!user) throw new ApiError(401, path, "Utilisateur non connecté");

  const url = new URL(path.startsWith("/") ? path : `/${path}`, API_BASE_URL);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) url.searchParams.set(k, Array.isArray(v) ? v.join(",") : String(v));
    }
  }

  const doFetch = async (forceRefresh: boolean) => {
    const token = await user.getIdToken(forceRefresh);
    return fetch(url.toString(), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  };

  let res = await doFetch(false);
  if (res.status === 401) res = await doFetch(true); // retry avec token frais
  if (!res.ok) throw new ApiError(res.status, path);
  return (await res.json()) as T;
}

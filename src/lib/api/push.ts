"use client";

import { trackFeature } from "@/lib/analytics";
import { auth } from "@/lib/firebase";
import { API_BASE_URL } from "./config";

/** Clé VAPID publique (injectée au build). */
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * POST vers /push/* avec Bearer Firebase SI l'utilisateur est connecté, sinon
 * anonyme. `/push/subscribe` est en @OptionalAuth côté API : un visiteur non
 * connecté peut s'abonner (opt-in depuis un lien partagé).
 */
async function pushPost(path: string, body: unknown): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const user = auth?.currentUser;
  if (user) {
    try {
      headers.Authorization = `Bearer ${await user.getIdToken()}`;
    } catch {
      /* token indisponible : on poursuit en anonyme */
    }
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Push ${path}: ${res.status}`);
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Abonne l'appareil au push : demande la permission, crée la PushSubscription,
 * puis l'enregistre côté serveur (lié au user Firebase). Renvoie la subscription.
 */
export async function subscribeToPush(): Promise<PushSubscription> {
  if (!VAPID_PUBLIC_KEY) throw new Error("Clé VAPID publique absente");
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));
  await pushPost("/push/subscribe", sub.toJSON());
  trackFeature("notif_enable");
  return sub;
}

/** Désabonne l'appareil (local + serveur). */
export async function unsubscribeFromPush(): Promise<void> {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await pushPost("/push/unsubscribe", { endpoint: sub.endpoint });
  await sub.unsubscribe();
  trackFeature("notif_disable");
}

export async function currentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

// ───────────────────────── Suivi par média (ciblage notifs) ─────────────────
// Miroir local des médias suivis : état UI instantané + offline-safe. La source
// de vérité reste le serveur (table push_follow), synchronisée à chaque action.
const FOLLOWS_KEY = "athena.notif.follows";

export function getFollowedKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(FOLLOWS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function persistFollowed(keys: Set<string>) {
  try {
    window.localStorage.setItem(FOLLOWS_KEY, JSON.stringify([...keys]));
  } catch {
    /* quota / mode privé : l'état serveur fait foi */
  }
}

/** Suivre un média (requiert un abonnement push déjà créé). */
export async function followMedia(mediaKey: string): Promise<void> {
  const sub = await currentPushSubscription();
  if (!sub) throw new Error("Pas d'abonnement push");
  await pushPost("/push/follow", { endpoint: sub.endpoint, mediaKey });
  const next = getFollowedKeys();
  next.add(mediaKey);
  persistFollowed(next);
}

/** Ne plus suivre un média. */
export async function unfollowMedia(mediaKey: string): Promise<void> {
  const sub = await currentPushSubscription();
  if (sub) {
    await pushPost("/push/unfollow", { endpoint: sub.endpoint, mediaKey });
  }
  const next = getFollowedKeys();
  next.delete(mediaKey);
  persistFollowed(next);
}

/**
 * Active les notifs si besoin (permission + abonnement) PUIS suit le média.
 * Utilisé par l'opt-in et le bouton « Suivre ». Lève si la permission est
 * refusée ou le push indisponible.
 */
export async function enableAndFollow(mediaKey: string): Promise<void> {
  await subscribeToPush();
  await followMedia(mediaKey);
}

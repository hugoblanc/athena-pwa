"use client";

import { useEffect } from "react";

/** Enregistre le service worker /sw.js (PWA installable + push). */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return; // évite le cache SW en dev
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        /* échec silencieux : l'app marche sans SW */
      });
  }, []);
  return null;
}

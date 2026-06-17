"use client";

import { useEffect } from "react";
import { initA2HS } from "@/lib/a2hs";

/** Enregistre le service worker /sw.js (PWA installable + push). */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    // Capture globale de l'invite d'installation (avant la garde dev : utile
    // aussi en dev, et indépendant du service worker).
    initA2HS();
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

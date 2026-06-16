"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Init Firebase côté client (projet `open-athena`, repris de l'existant).
 * Config via variables NEXT_PUBLIC_FIREBASE_* (cf. .env.example).
 *
 * RÉSILIENT : si la config est absente (ex. dev sans clés), `auth` vaut `null`
 * au lieu de planter — indispensable pour le MODE INVITÉ (lecture publique
 * sans authentification).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? (getApps()[0] ?? initializeApp(firebaseConfig))
  : null;

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

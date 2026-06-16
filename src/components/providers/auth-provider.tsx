"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auth } from "@/lib/firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Contexte d'authentification Firebase. Monté au layout racine.
 * Mode invité : `user` peut rester `null` ; les écrans publics ne le gatent pas.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false); // mode invité : Firebase non configuré
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const notConfigured = () => {
      throw new Error("Authentification non disponible (Firebase non configuré).");
    };
    return {
      user,
      loading,
      signInWithGoogle: async () => {
        if (!auth) return notConfigured();
        await signInWithPopup(auth, new GoogleAuthProvider());
      },
      signInWithEmail: async (email, password) => {
        if (!auth) return notConfigured();
        await signInWithEmailAndPassword(auth, email, password);
      },
      register: async (email, password) => {
        if (!auth) return notConfigured();
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signOut: async () => {
        if (auth) await fbSignOut(auth);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
}

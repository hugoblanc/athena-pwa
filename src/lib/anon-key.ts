/**
 * Clé anonyme stable par appareil, pour la dédup serveur des votes roadmap
 * quand l'utilisateur n'est pas connecté (cf. athena_api IdeaVote.anonKey).
 * Générée et persistée en localStorage. Côté serveur (SSR) : renvoie undefined.
 */
const STORAGE_KEY = "athena:anon-key";

export function getAnonKey(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let key = window.localStorage.getItem(STORAGE_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(STORAGE_KEY, key);
    }
    return key;
  } catch {
    return undefined;
  }
}

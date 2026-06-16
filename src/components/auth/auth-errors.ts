/**
 * Traduit les codes d'erreur Firebase Auth en messages clairs en français.
 * Les codes bruts (`auth/invalid-credential`, …) sont anglais et cryptiques.
 */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/invalid-email": "Adresse email invalide.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/user-not-found": "Aucun compte ne correspond à cet email.",
  "auth/wrong-password": "Email ou mot de passe incorrect.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/missing-password": "Veuillez saisir un mot de passe.",
  "auth/too-many-requests":
    "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/network-request-failed":
    "Connexion impossible, vérifiez votre réseau.",
  "auth/popup-blocked":
    "La fenêtre Google a été bloquée par le navigateur.",
  "auth/operation-not-allowed":
    "Cette méthode de connexion n'est pas activée.",
};

/** Code Firebase silencieux (l'utilisateur a fermé la popup volontairement). */
export const SILENT_AUTH_ERRORS = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

function codeOf(error: unknown): string | undefined {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code: unknown }).code);
  }
  return undefined;
}

/** `true` si l'erreur ne doit PAS être affichée (annulation utilisateur). */
export function isSilentAuthError(error: unknown): boolean {
  const code = codeOf(error);
  return code != null && SILENT_AUTH_ERRORS.has(code);
}

/** Message FR pour une erreur Firebase (fallback générique sinon). */
export function mapAuthError(error: unknown): string {
  const code = codeOf(error);
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Une erreur est survenue. Veuillez réessayer.";
}

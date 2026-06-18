/**
 * Flags de fonctionnalités (toggle simple, sans lib).
 *
 * QA_ENABLED : la feature « Demander à Athena » (Q&A IA) est masquée pour
 * l'instant — son historique était global/public (fuite de confidentialité).
 * À RÉACTIVER une fois l'authentification en place : la feature ne sera alors
 * accessible qu'aux utilisateurs connectés, avec un historique scopé par compte.
 */
export const QA_ENABLED = false;

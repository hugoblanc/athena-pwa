import type messages from "../../messages/fr.json";

/**
 * Sécurité de type des clés de traduction : `useTranslations`/`getTranslations`
 * n'acceptent que des clés présentes dans `fr.json` (la référence).
 */
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}

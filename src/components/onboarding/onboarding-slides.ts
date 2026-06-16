import type { LucideIcon } from "lucide-react";
import { Bell, Headphones, Radio } from "lucide-react";

export interface OnboardingSlide {
  icon: LucideIcon;
  title: string;
  text: string;
}

/** Contenu des 3 slides du tuto premier lancement (en dur, typé). */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    icon: Radio,
    title: "Les médias libres, réunis",
    text: "Athena agrège les articles, vidéos et podcasts des médias indépendants en un seul fil d'actualité.",
  },
  {
    icon: Headphones,
    title: "Écoutez vos contenus",
    text: "Chaque article peut être lu à voix haute (audio TTS). Idéal en déplacement, mains libres.",
  },
  {
    icon: Bell,
    title: "Restez au courant",
    text: "Activez les notifications pour ne rien manquer des nouvelles publications de vos médias préférés. Vous pourrez le faire plus tard depuis les réglages.",
  },
];

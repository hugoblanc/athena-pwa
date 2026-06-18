/**
 * Types partagés du domaine Athena.
 * Source : design-spike/AUDIT.md §4 (contrat de l'API NestJS existante).
 */

// ───────────────────────── Meta-media / sources ─────────────────────────
export type MetaMediaType = "YOUTUBE" | "WORDPRESS";

export interface MetaMedia {
  key: string;
  url: string;
  title: string;
  type: MetaMediaType;
  logo: string;
  donation?: string;
  isDonationActivated?: boolean;
  notification?: string;
}

export interface ListMetaMedia {
  id: number;
  title: string;
  metaMedias: MetaMedia[];
}

// ───────────────────────── Content ─────────────────────────
export interface Image {
  id?: number;
  url: string;
  width: number;
  height: number;
}

export interface ContentLite {
  id: number;
  contentId: string;
  title: string;
  publishedAt: string;
  image: Image;
  metaMedia: {
    id: number;
    key: string;
    title: string;
    logo: string;
    type: MetaMediaType;
  };
  /** Nombre de mots pré-calculé — exposé par le backend quand disponible.
   *  Absent de `/content/last` aujourd'hui : champ optionnel, prêt pour la
   *  prochaine évolution backend (#320). */
  wordCount?: number | null;
}

export interface Content extends ContentLite {
  description?: string;
  plainText?: string | null;
  contentType: MetaMediaType;
}

export interface ShareableContentResponse {
  image: { url: string; width: number; height: number };
  title: string;
  originalUrl: string;
  /** Média source — évite un 2e appel `getMetaMedias()` sur le SSR de partage. */
  mediaTitle: string;
  mediaType: string;
  mediaLogoUrl: string | null;
}

// ───────────────────────── Podcast ─────────────────────────
export interface Podcast {
  id: number;
  contentId: number;
  dialogueText: string;
  audioUrl: string;
  duration: number | null;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  content?: {
    id: number;
    contentId: string;
    title: string;
    contentType: string;
    description?: string;
    plainText?: string | null;
    publishedAt: string;
    meta_media: { id: number; key: string; title: string; logo: string };
    image?: Image;
  };
}

// ───────────────────────── QA ─────────────────────────
export interface QaSource {
  contentId: string;
  mediaKey: string;
  title: string;
  url: string;
  relevanceScore?: number;
  publishedAt?: string;
}

export interface QaHistoryItem {
  id: string;
  question: string;
  answer: string;
  sources: QaSource[];
  status: string;
  createdAt: string;
  completedAt?: string;
}

/** Événement SSE du flux QA (`GET /qa/stream/:jobId`). */
export type QaStreamEvent =
  | { type: "token"; content: string }
  | { type: "done"; sources?: QaSource[] }
  | { type: "error"; error: string };

// ───────────────────────── Law proposal ─────────────────────────
export type PoliticalGroupCode =
  | "RN" | "LFI_NFP" | "SOC" | "ECO" | "GDR" | "EPR"
  | "DEM" | "HOR" | "DR" | "UDR" | "NI" | "UNKNOWN";

export interface Depute {
  nom: string;
  groupePolitique: string;
  groupePolitiqueCode: PoliticalGroupCode;
  photoUrl: string | null;
  urlDepute: string | null;
}

export interface SimplifiedVersion {
  status: "completed" | "pending" | "failed";
  generatedAt?: string;
  keyPoints: string[];
  exposeMotifs?: { ordre: number; titre: string; texte: string }[];
  articles?: { ordre: number; numero: string; resume: string }[];
}

export interface LawProposalSummary {
  numero: string;
  titre: string;
  typeProposition: "ordinaire" | "constitutionnelle";
  dateMiseEnLigne: string;
  dateDepot: string | null;
  auteur: Depute;
  coSignatairesCount: number;
  simplified?: { status: string; keyPoints: string[] };
}

export interface LawProposal
  extends Omit<LawProposalSummary, "coSignatairesCount" | "simplified"> {
  legislature: string;
  description: string | null;
  urlDocument: string;
  urlDossierLegislatif: string | null;
  coSignataires: Depute[];
  simplified?: SimplifiedVersion;
}

// ───────────────────────── Auth / User ─────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  provider: string;
  createdAt: string;
  lastLoginAt: string;
}

// ───────────────────────── Roadmap / Issues ─────────────────────────
export interface Issue {
  id?: number;
  title: string;
  body?: string;
  claps?: number;
}

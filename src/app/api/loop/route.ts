import { createHash } from "node:crypto";
import { API_BASE_URL } from "@/lib/api/config";

/**
 * BFF de mesure : reçoit un événement de la growth loop (même origine, pas de
 * CORS), calcule une empreinte quotidienne NON RÉVERSIBLE et NON PERSISTÉE
 * (sha256(IP + UA + sel-du-jour)) servant uniquement à dédupliquer les rafales
 * côté API, puis relaie à NestJS `/analytics/event`. Aucune donnée personnelle
 * n'est stockée — l'IP ne quitte jamais ce handler.
 */

const EVENTS = new Set([
  // Growth loop (partage)
  "preview_view",
  "value_reached",
  "reshare",
  "install",
  // Usage produit
  "screen_view",
  "feature_use",
  "play",
  "session_start",
]);
const REF_TYPES = new Set([
  // Catalogue
  "content",
  "law",
  "podcast",
  "qa",
  // Dimensions d'usage
  "screen",
  "feature",
  "session",
]);

/** Sel rotatif quotidien (UTC) : même jour → même hash, change chaque jour. */
function daySalt(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 204 });
  }

  const { event, refType, refId, ref } = (payload ?? {}) as Record<
    string,
    unknown
  >;

  // Validation stricte : on avale silencieusement tout payload non conforme.
  if (
    typeof event !== "string" ||
    !EVENTS.has(event) ||
    typeof refType !== "string" ||
    !REF_TYPES.has(refType) ||
    typeof refId !== "string" ||
    refId.length === 0
  ) {
    return new Response(null, { status: 204 });
  }

  const h = request.headers;
  const ip =
    (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0";
  const ua = h.get("user-agent") ?? "";
  const dayHash = createHash("sha256")
    .update(`${ip}|${ua}|${daySalt()}`)
    .digest("hex")
    .slice(0, 32);

  try {
    await fetch(`${API_BASE_URL}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        event,
        refType,
        refId: refId.slice(0, 128),
        ref: typeof ref === "string" ? ref.slice(0, 32) : undefined,
        dayHash,
      }),
    });
  } catch {
    /* best-effort : la mesure ne doit jamais casser l'UX */
  }

  return new Response(null, { status: 204 });
}

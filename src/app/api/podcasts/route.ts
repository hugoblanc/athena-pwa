import { NextResponse } from "next/server";
import { listPodcasts } from "@/lib/api/podcast";

/**
 * Proxy léger `GET /api/podcasts?page=&size=&terms=` → `listPodcasts`.
 * Réexpose la liste paginée au client (recherche + « charger plus ») sans
 * dépendre de l'URL de l'API côté navigateur, et bénéficie du cache HTTP.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const size = Number(searchParams.get("size") ?? "10") || 10;
  const terms = searchParams.get("terms")?.trim() || undefined;

  try {
    const data = await listPodcasts({ page, size, terms });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les podcasts" },
      { status: 502 },
    );
  }
}

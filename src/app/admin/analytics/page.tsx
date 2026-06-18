import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/api/config";

/**
 * Dashboard analytics ADMIN (usage produit + growth loop). Server Component :
 * la clé admin transite uniquement côté serveur (header `x-analytics-key`),
 * jamais dans le JS client. Accès : `/admin/analytics?key=LA_CLE&days=30`.
 * Sans clé valide, l'API NestJS renvoie 403/503 → on affiche un message.
 *
 * Volontairement minimal (tableaux), sans dépendance graphique. Aucune donnée
 * personnelle : tout est agrégé côté API.
 */

export const metadata: Metadata = {
  title: "Analytics (admin)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface UsageData {
  window: { days: number; from: string; to: string };
  screens: { key: string; count: number }[];
  features: { key: string; count: number }[];
  topPlayed: { refType: string; refId: string; count: number }[];
  sessions: {
    total: number;
    browser: number;
    installed: number;
    installedRate: number;
  };
  byDay: {
    day: string;
    screen_view: number;
    feature_use: number;
    play: number;
    session_start: number;
  }[];
}

interface FunnelData {
  totals: {
    preview_view: number;
    value_reached: number;
    reshare: number;
    install: number;
  };
  rates: { kFactor: number; valueRate: number; installRate: number };
  reshare: { total: number; fromApp: number; fromLanding: number };
}

async function fetchJson<T>(
  path: string,
  key: string,
): Promise<T | { error: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "x-analytics-key": key },
      cache: "no-store",
    });
    if (!res.ok) return { error: res.status };
    return (await res.json()) as T;
  } catch {
    return { error: 0 };
  }
}

function isError(v: unknown): v is { error: number } {
  return typeof v === "object" && v !== null && "error" in v;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
      <div className="text-[12px] uppercase tracking-wide text-text-faint">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-extrabold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function BarTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-[var(--radius)] border border-border bg-surface p-4">
      <h2 className="mb-3 font-display text-lg font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-text-dim">Aucune donnée sur la période.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate text-text-dim">
                {r.label}
              </span>
              <span className="relative h-5 flex-1 overflow-hidden rounded bg-surface-2">
                <span
                  className="absolute inset-y-0 left-0 rounded bg-primary/70"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-medium tabular-nums">
                {r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string; days?: string }>;
}) {
  const { key, days } = await searchParams;
  const wrap = "mx-auto max-w-[860px] px-5 pb-24 pt-6 lg:pb-10";

  if (!key) {
    return (
      <div className={wrap}>
        <h1 className="font-display text-2xl font-extrabold">
          Analytics (admin)
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Clé requise. Ajoutez <code>?key=VOTRE_CLE</code> à l’URL.
        </p>
        <form className="mt-4 flex gap-2" action="">
          <input
            name="key"
            type="password"
            placeholder="Clé admin"
            className="h-11 flex-1 rounded-[var(--radius)] border border-border bg-surface-2 px-3 text-text outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="h-11 rounded-[var(--radius)] bg-primary px-4 font-semibold text-on-primary"
          >
            Voir
          </button>
        </form>
      </div>
    );
  }

  const range = days ?? "30";
  const [usage, funnel] = await Promise.all([
    fetchJson<UsageData>(`/analytics/usage?days=${range}`, key),
    fetchJson<FunnelData>(`/analytics/funnel?days=${range}`, key),
  ]);

  if (isError(usage)) {
    const msg =
      usage.error === 403
        ? "Clé invalide."
        : usage.error === 503
          ? "Lecture analytics désactivée (ANALYTICS_ADMIN_KEY non configurée côté API)."
          : "Impossible de joindre l’API analytics.";
    return (
      <div className={wrap}>
        <h1 className="font-display text-2xl font-extrabold">
          Analytics (admin)
        </h1>
        <p className="mt-3 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm text-danger">
          {msg}
        </p>
      </div>
    );
  }

  const f = !isError(funnel) ? funnel : null;
  const ranges = [7, 14, 30, 90];

  return (
    <div className={wrap}>
      <div className="mb-1 flex items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.02em]">
          Analytics
        </h1>
        <nav className="flex gap-1.5 text-sm">
          {ranges.map((d) => (
            <a
              key={d}
              href={`?key=${encodeURIComponent(key)}&days=${d}`}
              className={`rounded-full px-3 py-1 font-semibold ${
                String(d) === range
                  ? "bg-primary text-on-primary"
                  : "bg-surface-2 text-text-dim hover:text-text"
              }`}
            >
              {d}j
            </a>
          ))}
        </nav>
      </div>
      <p className="mb-5 text-xs text-text-faint">
        {usage.window.from} → {usage.window.to} · données agrégées, anonymes
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sessions" value={usage.sessions.total} />
        <Stat
          label="Dont installée"
          value={`${Math.round(usage.sessions.installedRate * 100)}%`}
        />
        <Stat
          label="Vues d’écran"
          value={usage.screens.reduce((s, r) => s + r.count, 0)}
        />
        <Stat
          label="Lectures audio"
          value={usage.topPlayed.reduce((s, r) => s + r.count, 0)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BarTable
          title="Écrans les plus vus"
          rows={usage.screens.map((s) => ({ label: s.key, count: s.count }))}
        />
        <BarTable
          title="Features les plus utilisées"
          rows={usage.features.map((s) => ({ label: s.key, count: s.count }))}
        />
      </div>

      <div className="mt-4">
        <BarTable
          title="Top contenus joués"
          rows={usage.topPlayed.map((p) => ({
            label: `${p.refType}:${p.refId}`,
            count: p.count,
          }))}
        />
      </div>

      {f && (
        <section className="mt-5 rounded-[var(--radius)] border border-border bg-surface p-4">
          <h2 className="mb-3 font-display text-lg font-bold">
            Growth loop (partage)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="k-factor" value={f.rates.kFactor} />
            <Stat label="Re-partages" value={f.reshare.total} />
            <Stat label="Vues partagées" value={f.totals.preview_view} />
            <Stat label="Installs" value={f.totals.install} />
          </div>
        </section>
      )}

      <section className="mt-4 rounded-[var(--radius)] border border-border bg-surface p-4">
        <h2 className="mb-3 font-display text-lg font-bold">
          Activité par jour
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead className="text-left text-text-faint">
              <tr>
                <th className="py-1 pr-4 font-medium">Jour</th>
                <th className="py-1 pr-4 font-medium">Écrans</th>
                <th className="py-1 pr-4 font-medium">Features</th>
                <th className="py-1 pr-4 font-medium">Lectures</th>
                <th className="py-1 font-medium">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {usage.byDay.map((d) => (
                <tr key={d.day} className="border-t border-border/60">
                  <td className="py-1 pr-4 text-text-dim">{d.day}</td>
                  <td className="py-1 pr-4">{d.screen_view}</td>
                  <td className="py-1 pr-4">{d.feature_use}</td>
                  <td className="py-1 pr-4">{d.play}</td>
                  <td className="py-1">{d.session_start}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { StatCard } from "@/components/admin/stat-card";

type TrafficStats = {
  updatedAt: string;
  timezone: string;
  recentViews: number;
  todayViews: number;
  viewsLast30Days: number;
  minuteBuckets: { minute: string; views: number }[];
  topPagesToday: { path: string; views: number }[];
  ga4?:
    | { configured: false }
    | {
        configured: true;
        realtimeActiveUsers: number;
        usActiveUsersNow: number;
        todaySessions: number;
        todayActiveUsers: number;
        usSessionsToday: number;
        topCountriesNow: { country: string; activeUsers: number }[];
        topSources: { source: string; sessions: number }[];
      }
    | {
        configured: true;
        error: string;
      };
};

const POLL_INTERVAL_MS = 30_000;

function formatCount(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatTimeLabel(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function TrafficStats() {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/admin/analytics/traffic", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load traffic stats.");
        }

        const data = (await response.json()) as TrafficStats;
        if (active) {
          setStats(data);
          setError(null);
        }
      } catch {
        if (active) {
          setError("Unable to load live traffic.");
        }
      }
    }

    void loadStats();
    const interval = window.setInterval(() => {
      void loadStats();
    }, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const timezone = stats?.timezone ?? "Asia/Jakarta";
  const maxBucketViews = Math.max(
    ...(stats?.minuteBuckets.map((bucket) => bucket.views) ?? [1]),
    1,
  );
  const firstBucket = stats?.minuteBuckets[0];
  const lastBucket = stats?.minuteBuckets.at(-1);
  const hasAnyHourlyViews =
    stats?.minuteBuckets.some((bucket) => bucket.views > 0) ?? false;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium">Storefront traffic</h2>
          <p className="text-sm text-muted-foreground">
            First-party page views (exact counts, {timezone}). Refreshes every
            30 seconds.
          </p>
        </div>
        {stats ? (
          <p className="text-xs text-muted-foreground">
            Updated{" "}
            {new Date(stats.updatedAt).toLocaleTimeString("id-ID", {
              timeZone: timezone,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}{" "}
            WIB
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Live (5 menit)"
          value={stats ? formatCount(stats.recentViews) : "—"}
          hint="Aktivitas storefront terkini"
        />
        <StatCard
          label="Hari ini (WIB)"
          value={stats ? formatCount(stats.todayViews) : "—"}
          hint="00:00–sekarang WIB"
        />
        <StatCard
          label="30 hari terakhir"
          value={stats ? formatCount(stats.viewsLast30Days) : "—"}
          hint="Rolling 30 days"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">60 menit terakhir</h3>
            <p className="text-xs text-muted-foreground">
              Page views per menit ({timezone})
            </p>
          </div>
          <div className="p-4">
            {stats ? (
              hasAnyHourlyViews ? (
                <div className="space-y-2">
                  <div className="flex h-28 items-end gap-1">
                    {stats.minuteBuckets.map((bucket) => (
                      <div
                        key={bucket.minute}
                        className="flex-1 rounded-sm bg-primary/80"
                        style={{
                          height: `${Math.max(
                            8,
                            (bucket.views / maxBucketViews) * 100,
                          )}%`,
                          opacity: bucket.views > 0 ? 1 : 0.2,
                        }}
                        title={`${formatTimeLabel(bucket.minute, timezone)}: ${formatCount(bucket.views)} views`}
                      />
                    ))}
                  </div>
                  {firstBucket && lastBucket ? (
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{formatTimeLabel(firstBucket.minute, timezone)}</span>
                      <span>{formatTimeLabel(lastBucket.minute, timezone)}</span>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada page view dalam 60 menit terakhir.
                </p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Loading chart…</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Halaman teratas hari ini</h3>
            <p className="text-xs text-muted-foreground">Sejak 00:00 WIB</p>
          </div>
          <div className="divide-y">
            {!stats ? (
              <p className="p-4 text-sm text-muted-foreground">Loading pages…</p>
            ) : stats.topPagesToday.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Belum ada page view hari ini.
              </p>
            ) : (
              stats.topPagesToday.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate font-mono text-xs" title={page.path}>
                    {page.path === "/" ? "/ (home)" : page.path}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(page.views)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Ga4TrafficPanel ga4={stats?.ga4} />
    </section>
  );
}

function Ga4TrafficPanel({
  ga4,
}: {
  ga4: TrafficStats["ga4"];
}) {
  if (!ga4) {
    return null;
  }

  if (!ga4.configured) {
    return (
      <section className="overflow-hidden rounded-xl border border-dashed bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Google Analytics</h3>
          <p className="text-xs text-muted-foreground">
            Sessions &amp; active users — separate from first-party page views
            above.
          </p>
        </div>
        <p className="p-4 text-sm text-muted-foreground">
          Add <code className="text-xs">NEXT_PUBLIC_GA_ID</code> for storefront
          tracking. Optional: set <code className="text-xs">GA4_PROPERTY_ID</code>
          , <code className="text-xs">GA4_CLIENT_EMAIL</code>, and{" "}
          <code className="text-xs">GA4_PRIVATE_KEY</code> to show GA4 summaries
          here.
        </p>
      </section>
    );
  }

  if ("error" in ga4) {
    return (
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Google Analytics</h3>
        </div>
        <p className="p-4 text-sm text-destructive">{ga4.error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-medium">Google Analytics</h3>
        <p className="text-xs text-muted-foreground">
          Sessions &amp; active users from GA4 — not the same as first-party page
          views above. Realtime refreshes about every minute; daily sessions can
          lag by several hours.
        </p>
      </div>

      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active users now"
          value={formatCount(ga4.realtimeActiveUsers)}
          hint="Matches GA4 Realtime"
        />
        <StatCard
          label="US active users now"
          value={formatCount(ga4.usActiveUsersNow)}
          hint="Realtime, United States"
        />
        <StatCard
          label="Sessions today"
          value={formatCount(ga4.todaySessions)}
          hint="Daily report — may show 0 early in the day"
        />
        <StatCard
          label="US sessions today"
          value={formatCount(ga4.usSessionsToday)}
          hint="Daily report — updates later"
        />
      </div>

      <div className="grid gap-6 border-t lg:grid-cols-2">
        <section>
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-medium">Active users by country (now)</h4>
          </div>
          <div className="divide-y">
            {ga4.topCountriesNow.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No active users right now.
              </p>
            ) : (
              ga4.topCountriesNow.map((row) => (
                <div
                  key={row.country}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{row.country}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(row.activeUsers)} active
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-medium">Top traffic sources (today)</h4>
          </div>
          <div className="divide-y">
            {ga4.topSources.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                Daily sources appear after GA4 finishes processing today&apos;s
                data.
              </p>
            ) : (
              ga4.topSources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{source.source}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(source.sessions)} sessions
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

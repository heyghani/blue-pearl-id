"use client";

import { useEffect, useState } from "react";

import { StatCard } from "@/components/admin/stat-card";

type TrafficStats = {
  updatedAt: string;
  recentViews: number;
  todayViews: number;
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

const POLL_INTERVAL_MS = 10_000;

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

  const maxBucketViews = Math.max(...(stats?.minuteBuckets.map((bucket) => bucket.views) ?? [1]), 1);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-medium">Storefront traffic</h2>
          <p className="text-sm text-muted-foreground">
            Live page views refresh every 10 seconds.
          </p>
        </div>
        {stats ? (
          <p className="text-xs text-muted-foreground">
            Updated {new Date(stats.updatedAt).toLocaleTimeString()}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Views (last 5 min)"
          value={stats?.recentViews ?? "—"}
          hint="Recent storefront activity"
        />
        <StatCard
          label="Views today"
          value={stats?.todayViews ?? "—"}
          hint="Since midnight"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Last 60 minutes</h3>
          </div>
          <div className="p-4">
            {stats ? (
              <div className="flex h-28 items-end gap-1">
                {stats.minuteBuckets.map((bucket) => (
                  <div
                    key={bucket.minute}
                    className="flex-1 rounded-sm bg-primary/80"
                    style={{
                      height: `${Math.max(8, (bucket.views / maxBucketViews) * 100)}%`,
                      opacity: bucket.views > 0 ? 1 : 0.2,
                    }}
                    title={`${new Date(bucket.minute).toLocaleTimeString()}: ${bucket.views} views`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading chart…</p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Top pages today</h3>
          </div>
          <div className="divide-y">
            {!stats ? (
              <p className="p-4 text-sm text-muted-foreground">Loading pages…</p>
            ) : stats.topPagesToday.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No page views yet.</p>
            ) : (
              stats.topPagesToday.map((page) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate font-mono text-xs">{page.path}</span>
                  <span className="shrink-0 text-muted-foreground">{page.views}</span>
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
        </div>
        <p className="p-4 text-sm text-muted-foreground">
          Add <code className="text-xs">NEXT_PUBLIC_GA_ID</code> for storefront tracking.
          Optional: set <code className="text-xs">GA4_PROPERTY_ID</code>,{" "}
          <code className="text-xs">GA4_CLIENT_EMAIL</code>, and{" "}
          <code className="text-xs">GA4_PRIVATE_KEY</code> to show GA4 summaries here.
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
          Realtime data refreshes about every minute. Daily sessions can lag behind GA4 Realtime by several hours.
        </p>
      </div>

      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active users now"
          value={ga4.realtimeActiveUsers}
          hint="Matches GA4 Realtime"
        />
        <StatCard
          label="US active users now"
          value={ga4.usActiveUsersNow}
          hint="Realtime, United States"
        />
        <StatCard
          label="Sessions today"
          value={ga4.todaySessions}
          hint="Daily report — may show 0 early in the day"
        />
        <StatCard
          label="US sessions today"
          value={ga4.usSessionsToday}
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
              <p className="p-4 text-sm text-muted-foreground">No active users right now.</p>
            ) : (
              ga4.topCountriesNow.map((row) => (
                <div
                  key={row.country}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{row.country}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {row.activeUsers} active
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
                Daily sources appear after GA4 finishes processing today&apos;s data.
              </p>
            ) : (
              ga4.topSources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{source.source}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {source.sessions} sessions
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

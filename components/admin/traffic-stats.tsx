"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { StatCard } from "@/components/admin/stat-card";
import { cn } from "@/lib/utils";

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
  return new Intl.NumberFormat("en-US").format(value);
}

function formatClock(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
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
          setError("Unable to load traffic.");
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
  const maxTopViews = Math.max(
    ...(stats?.topPagesToday.map((page) => page.views) ?? [1]),
    1,
  );

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-medium">Storefront traffic</h2>
        {stats ? (
          <p className="text-xs text-muted-foreground">
            Updated {formatClock(stats.updatedAt, timezone)}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Live · 5 min"
          value={stats ? formatCount(stats.recentViews) : "—"}
        />
        <StatCard
          label="Today"
          value={stats ? formatCount(stats.todayViews) : "—"}
        />
        <StatCard
          label="Last 30 days"
          value={stats ? formatCount(stats.viewsLast30Days) : "—"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-medium">Last 60 minutes</h3>
            {stats ? (
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatCount(
                  stats.minuteBuckets.reduce((sum, b) => sum + b.views, 0),
                )}{" "}
                views
              </span>
            ) : null}
          </div>
          <div className="p-4 pt-3">
            {!stats ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : (
              <MinuteViewsChart
                buckets={stats.minuteBuckets}
                timeZone={timezone}
              />
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium">Top pages today</h3>
          </div>
          <div className="divide-y">
            {!stats ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : stats.topPagesToday.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No views yet.</p>
            ) : (
              stats.topPagesToday.map((page) => (
                <div
                  key={page.path}
                  className="relative flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-muted/60"
                    style={{
                      width: `${(page.views / maxTopViews) * 100}%`,
                    }}
                    aria-hidden
                  />
                  <span
                    className="relative truncate font-mono text-xs"
                    title={page.path}
                  >
                    {page.path === "/" ? "/" : page.path}
                  </span>
                  <span className="relative shrink-0 tabular-nums text-muted-foreground">
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

function MinuteViewsChart({
  buckets,
  timeZone,
}: {
  buckets: { minute: string; views: number }[];
  timeZone: string;
}) {
  const gradientId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const maxViews = Math.max(...buckets.map((b) => b.views), 0);
  const hasViews = maxViews > 0;

  const width = 600;
  const height = 160;
  const padL = 28;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const points = useMemo(() => {
    if (buckets.length === 0) return [];
    return buckets.map((bucket, index) => {
      const x =
        padL +
        (buckets.length === 1 ? plotW / 2 : (index / (buckets.length - 1)) * plotW);
      const y =
        padT +
        (maxViews === 0 ? plotH : plotH - (bucket.views / maxViews) * plotH);
      return { x, y, ...bucket };
    });
  }, [buckets, maxViews, padL, padT, plotH, plotW]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
    const last = points[points.length - 1];
    const first = points[0];
    return `${line} L ${last.x.toFixed(2)} ${(padT + plotH).toFixed(2)} L ${first.x.toFixed(2)} ${(padT + plotH).toFixed(2)} Z`;
  }, [points, padT, plotH]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
  }, [points]);

  const yTicks = useMemo(() => {
    if (maxViews <= 0) return [0];
    if (maxViews === 1) return [0, 1];
    const mid = Math.round(maxViews / 2);
    return [0, mid, maxViews].filter(
      (v, i, arr) => arr.indexOf(v) === i,
    );
  }, [maxViews]);

  const first = buckets[0];
  const last = buckets.at(-1);
  const active = hovered !== null ? points[hovered] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        role="img"
        aria-label="Page views over the last 60 minutes"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map((tick) => {
          const y =
            padT + (maxViews === 0 ? plotH : plotH - (tick / maxViews) * plotH);
          return (
            <g key={tick}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray={tick === 0 ? undefined : "3 4"}
              />
              <text
                x={padL - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={10}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {hasViews ? (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} className="text-foreground" />
            <path
              d={linePath}
              fill="none"
              className="stroke-foreground"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {/* Hover hit targets */}
        {points.map((point, index) => (
          <rect
            key={point.minute}
            x={point.x - plotW / buckets.length / 2}
            y={padT}
            width={Math.max(plotW / buckets.length, 4)}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHovered(index)}
          />
        ))}

        {active && active.views > 0 ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={padT}
              y2={padT + plotH}
              className="stroke-foreground/25"
              strokeWidth={1}
            />
            <circle
              cx={active.x}
              cy={active.y}
              r={4}
              className="fill-background stroke-foreground"
              strokeWidth={2}
            />
          </>
        ) : null}

        {first && last ? (
          <>
            <text
              x={padL}
              y={height - 6}
              className="fill-muted-foreground"
              fontSize={10}
            >
              {formatClock(first.minute, timeZone)}
            </text>
            <text
              x={width - padR}
              y={height - 6}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {formatClock(last.minute, timeZone)}
            </text>
          </>
        ) : null}
      </svg>

      {!hasViews ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No activity in the last hour</p>
        </div>
      ) : null}

      {active ? (
        <div
          className={cn(
            "pointer-events-none absolute top-2 rounded-md border bg-background/95 px-2 py-1 text-xs shadow-sm backdrop-blur-sm",
            active.x / width > 0.7 ? "right-3" : "left-10",
          )}
        >
          <span className="tabular-nums text-muted-foreground">
            {formatClock(active.minute, timeZone)}
          </span>
          <span className="mx-1.5 text-border">·</span>
          <span className="font-medium tabular-nums">
            {formatCount(active.views)}{" "}
            {active.views === 1 ? "view" : "views"}
          </span>
        </div>
      ) : null}
    </div>
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
          Add <code className="text-xs">NEXT_PUBLIC_GA_ID</code> to enable. Set{" "}
          <code className="text-xs">GA4_PROPERTY_ID</code>,{" "}
          <code className="text-xs">GA4_CLIENT_EMAIL</code>, and{" "}
          <code className="text-xs">GA4_PRIVATE_KEY</code> for dashboard
          summaries.
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
      </div>

      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active users now"
          value={formatCount(ga4.realtimeActiveUsers)}
        />
        <StatCard
          label="US active now"
          value={formatCount(ga4.usActiveUsersNow)}
        />
        <StatCard
          label="Sessions today"
          value={formatCount(ga4.todaySessions)}
        />
        <StatCard
          label="US sessions today"
          value={formatCount(ga4.usSessionsToday)}
        />
      </div>

      <div className="grid gap-6 border-t lg:grid-cols-2">
        <section>
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-medium">By country</h4>
          </div>
          <div className="divide-y">
            {ga4.topCountriesNow.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No active users.</p>
            ) : (
              ga4.topCountriesNow.map((row) => (
                <div
                  key={row.country}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{row.country}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(row.activeUsers)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="border-b px-4 py-3">
            <h4 className="text-sm font-medium">Top sources</h4>
          </div>
          <div className="divide-y">
            {ga4.topSources.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No data yet.</p>
            ) : (
              ga4.topSources.map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="truncate">{source.source}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(source.sessions)}
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

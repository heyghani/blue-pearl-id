import { prisma } from "@/lib/db";

const TRACKABLE_PREFIXES = [
  "/",
  "/products",
  "/cart",
  "/checkout",
  "/account",
  "/lookbook",
  "/legal",
  "/payment",
];

const TIMEZONE = "Asia/Jakarta";
const RETENTION_DAYS = 35;
const STATS_WINDOW_DAYS = 30;

function isTrackablePath(path: string) {
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return false;
  }

  return TRACKABLE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** Start of the current calendar day in Asia/Jakarta, as a UTC Date. */
function startOfTodayInTimeZone(timeZone: string, now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  // Interpret Y-M-D 00:00 in the target zone via a temporary UTC guess + offset correction.
  const utcGuess = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, new Date(utcGuess));
  return new Date(utcGuess - offsetMinutes * 60_000);
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const tzName = formatter
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;

  // e.g. "GMT+7", "GMT+07:00", "GMT-5:30"
  const match = tzName?.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
}

export async function recordPageView(path: string, referrer?: string | null) {
  if (!isTrackablePath(path)) {
    return;
  }

  await prisma.pageView.create({
    data: {
      path,
      referrer: referrer || null,
    },
  });
}

async function pruneOldPageViews(now: Date) {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  try {
    await prisma.pageView.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
  } catch {
    // Best-effort retention; stats must still return.
  }
}

export async function getPageViewTrafficStats() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const startOfDay = startOfTodayInTimeZone(TIMEZONE, now);
  const thirtyDaysAgo = new Date(
    now.getTime() - STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  // Soft retention — do not block stats on prune latency.
  void pruneOldPageViews(now);

  const [recentViews, hourlyBuckets, todayViews, viewsLast30Days, topPagesToday] =
    await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: fiveMinutesAgo } },
      }),
      prisma.$queryRaw<Array<{ minute: Date; views: bigint }>>`
      SELECT date_trunc('minute', "createdAt") AS minute,
             COUNT(*)::bigint AS views
      FROM page_views
      WHERE "createdAt" >= ${oneHourAgo}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
      prisma.pageView.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: startOfDay } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
    ]);

  const viewsByMinute = new Map(
    hourlyBuckets.map((bucket) => [
      new Date(bucket.minute).setSeconds(0, 0),
      Number(bucket.views),
    ]),
  );

  const minuteBuckets = Array.from({ length: 60 }, (_, index) => {
    const bucketStart = new Date(now.getTime() - (59 - index) * 60 * 1000);
    bucketStart.setSeconds(0, 0);

    return {
      minute: bucketStart.toISOString(),
      views: viewsByMinute.get(bucketStart.getTime()) ?? 0,
    };
  });

  return {
    updatedAt: now.toISOString(),
    timezone: TIMEZONE,
    recentViews,
    todayViews,
    viewsLast30Days,
    minuteBuckets,
    topPagesToday: topPagesToday.map((item) => ({
      path: item.path,
      views: item._count.path,
    })),
  };
}

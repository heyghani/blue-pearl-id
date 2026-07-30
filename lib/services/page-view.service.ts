import { prisma } from "@/lib/db";

const TRACKABLE_PREFIXES = [
  "/",
  "/products",
  "/cart",
  "/checkout",
  "/account",
  "/lookbook",
];

/** Record ~1 in 4 views to cut write amplification while keeping relative trends. */
const SAMPLE_RATE = 0.25;

function isTrackablePath(path: string) {
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return false;
  }

  return TRACKABLE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export async function recordPageView(path: string, referrer?: string | null) {
  if (!isTrackablePath(path)) {
    return;
  }

  if (Math.random() > SAMPLE_RATE) {
    return;
  }

  await prisma.pageView.create({
    data: {
      path,
      referrer: referrer || null,
    },
  });
}

export async function getPageViewTrafficStats() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [recentViews, hourlyBuckets, todayViews, topPagesToday] = await Promise.all([
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
      // Scale sampled writes back to approximate full traffic.
      views: Math.round((viewsByMinute.get(bucketStart.getTime()) ?? 0) / SAMPLE_RATE),
    };
  });

  return {
    updatedAt: now.toISOString(),
    recentViews: Math.round(recentViews / SAMPLE_RATE),
    todayViews: Math.round(todayViews / SAMPLE_RATE),
    minuteBuckets,
    topPagesToday: topPagesToday.map((item) => ({
      path: item.path,
      views: Math.round(item._count.path / SAMPLE_RATE),
    })),
  };
}

import { TRAFFIC_BOOST_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/db";

const TRACKABLE_PREFIXES = [
  "/",
  "/products",
  "/cart",
  "/checkout",
  "/account",
  TRAFFIC_BOOST_PAGE,
];

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

  await prisma.pageView.create({
    data: {
      path,
      referrer: referrer || null,
    },
  });
}

function getTrafficBoostViewCount() {
  const min = Number.parseInt(process.env.TRAFFIC_BOOST_VIEWS_MIN ?? "24", 10);
  const max = Number.parseInt(process.env.TRAFFIC_BOOST_VIEWS_MAX ?? "48", 10);
  const lower = Number.isFinite(min) ? min : 24;
  const upper = Number.isFinite(max) ? max : 48;

  if (upper <= lower) {
    return lower;
  }

  return lower + Math.floor(Math.random() * (upper - lower + 1));
}

export async function recordSimulatedPageViews(
  path: string,
  count = getTrafficBoostViewCount(),
) {
  if (count <= 0) {
    return 0;
  }

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  await prisma.pageView.createMany({
    data: Array.from({ length: count }, () => ({
      path,
      referrer: "traffic-boost",
      createdAt: new Date(now - Math.floor(Math.random() * hourMs)),
    })),
  });

  return count;
}

export async function getPageViewTrafficStats() {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const [recentViews, hourlyViews, todayViews, topPagesToday] = await Promise.all([
    prisma.pageView.count({
      where: { createdAt: { gte: fiveMinutesAgo } },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: oneHourAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
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

  const minuteBuckets = Array.from({ length: 60 }, (_, index) => {
    const bucketStart = new Date(now.getTime() - (59 - index) * 60 * 1000);
    bucketStart.setSeconds(0, 0);

    const bucketEnd = new Date(bucketStart.getTime() + 60 * 1000);
    const views = hourlyViews.filter(
      (view) => view.createdAt >= bucketStart && view.createdAt < bucketEnd,
    ).length;

    return {
      minute: bucketStart.toISOString(),
      views,
    };
  });

  return {
    updatedAt: now.toISOString(),
    recentViews,
    todayViews,
    minuteBuckets,
    topPagesToday: topPagesToday.map((item) => ({
      path: item.path,
      views: item._count.path,
    })),
  };
}

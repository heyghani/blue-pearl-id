import { NextResponse } from "next/server";

import { TRAFFIC_BOOST_PAGE } from "@/lib/constants";
import { verifyCronRequest } from "@/lib/cron-auth";
import { recordSimulatedPageViews } from "@/lib/services/page-view.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (process.env.TRAFFIC_BOOST_ENABLED === "false") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const views = await recordSimulatedPageViews(TRAFFIC_BOOST_PAGE);

    return NextResponse.json({
      ok: true,
      path: TRAFFIC_BOOST_PAGE,
      views,
    });
  } catch {
    return NextResponse.json({ error: "Failed to record views." }, { status: 500 });
  }
}

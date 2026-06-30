import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getGa4DashboardStats } from "@/lib/analytics/ga4-server";
import { getPageViewTrafficStats } from "@/lib/services/page-view.service";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [stats, ga4] = await Promise.all([
    getPageViewTrafficStats(),
    getGa4DashboardStats(),
  ]);

  return NextResponse.json({ ...stats, ga4 });
}

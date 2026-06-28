import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin/require-admin";
import { getPageViewTrafficStats } from "@/lib/services/page-view.service";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const stats = await getPageViewTrafficStats();
  return NextResponse.json(stats);
}

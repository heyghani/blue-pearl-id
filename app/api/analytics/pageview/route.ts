import { NextResponse } from "next/server";
import { z } from "zod";

import { recordPageView } from "@/lib/services/page-view.service";

export const runtime = "nodejs";

const pageViewSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = pageViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const path = parsed.data.path.startsWith("/")
    ? parsed.data.path
    : `/${parsed.data.path}`;

  try {
    await recordPageView(path, parsed.data.referrer);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record view." }, { status: 500 });
  }
}

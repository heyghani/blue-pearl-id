import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getMetaCapiRequestContext,
  sendMetaCapiEvent,
} from "@/lib/analytics/meta-capi";

export const runtime = "nodejs";

const metaCapiSchema = z.object({
  event_name: z.string().trim().min(1).max(100),
  /** Must match browser Pixel eventID (Purchase → orderNumber). */
  event_id: z.string().trim().min(1).max(200),
  event_source_url: z.string().url().optional(),
  user_data: z
    .object({
      email: z.union([z.string().trim().email(), z.literal("")]).optional(),
      phone: z.union([z.string().trim().max(30), z.literal("")]).optional(),
      client_ip_address: z.string().trim().max(100).optional(),
      client_user_agent: z.string().trim().max(500).optional(),
      fbp: z.string().trim().max(200).optional(),
      fbc: z.string().trim().max(500).optional(),
    })
    .optional(),
  custom_data: z
    .object({
      value: z.number().finite().optional(),
      currency: z.string().trim().length(3).optional(),
      content_ids: z.array(z.string().trim().min(1)).max(100).optional(),
      content_type: z.string().trim().max(50).optional(),
      num_items: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = metaCapiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const context = await getMetaCapiRequestContext();
  const user = parsed.data.user_data;

  const result = await sendMetaCapiEvent({
    event_name: parsed.data.event_name,
    event_id: parsed.data.event_id,
    event_source_url: parsed.data.event_source_url,
    user_data: {
      email: user?.email || undefined,
      phone: user?.phone || undefined,
      client_ip_address:
        user?.client_ip_address || context.client_ip_address,
      client_user_agent:
        user?.client_user_agent || context.client_user_agent,
      fbp: user?.fbp || context.fbp,
      fbc: user?.fbc || context.fbc,
    },
    custom_data: parsed.data.custom_data,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status && result.status >= 400 ? result.status : 502 },
    );
  }

  return NextResponse.json(result);
}

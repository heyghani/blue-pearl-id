import { cookies, headers } from "next/headers";

import {
  hashMetaAdvancedMatchingValue,
  hashMetaPhone,
} from "@/lib/analytics/meta-advanced-matching";
import type { StoredShippingAddress } from "@/lib/addresses";

const GRAPH_API_VERSION = "v21.0";

export type MetaCapiUserDataInput = {
  email?: string | null;
  phone?: string | null;
  client_ip_address?: string | null;
  client_user_agent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type MetaCapiCustomData = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
};

export type MetaCapiEventInput = {
  event_name: string;
  /** Must match browser Pixel `eventID` for dedup (Purchase → orderNumber). */
  event_id: string;
  event_source_url?: string;
  event_time?: number;
  user_data?: MetaCapiUserDataInput;
  custom_data?: MetaCapiCustomData;
};

export type MetaCapiSendResult =
  | { ok: true; skipped?: boolean; reason?: string; events_received?: number }
  | { ok: false; error: string; status?: number };

function getMetaCapiConfig() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();

  if (!pixelId || !accessToken) {
    return null;
  }

  return { pixelId, accessToken, testEventCode };
}

function compactString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildUserData(input?: MetaCapiUserDataInput) {
  if (!input) return {};

  const userData: Record<string, string | string[]> = {};

  const em = input.email
    ? hashMetaAdvancedMatchingValue(input.email)
    : undefined;
  if (em) userData.em = [em];

  const ph = input.phone ? hashMetaPhone(input.phone) : undefined;
  if (ph) userData.ph = [ph];

  const ip = compactString(input.client_ip_address);
  if (ip) userData.client_ip_address = ip;

  const ua = compactString(input.client_user_agent);
  if (ua) userData.client_user_agent = ua;

  const fbp = compactString(input.fbp);
  if (fbp) userData.fbp = fbp;

  const fbc = compactString(input.fbc);
  if (fbc) userData.fbc = fbc;

  return userData;
}

/** Read IP / UA / `_fbp` / `_fbc` from the incoming Next.js request. */
export async function getMetaCapiRequestContext(): Promise<{
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}> {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);

  const forwarded = headerStore.get("x-forwarded-for");
  const client_ip_address =
    forwarded?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip")?.trim() ||
    undefined;

  return {
    client_ip_address,
    client_user_agent: headerStore.get("user-agent")?.trim() || undefined,
    fbp: cookieStore.get("_fbp")?.value,
    fbc: cookieStore.get("_fbc")?.value,
  };
}

/**
 * Send one event to Meta Conversions API.
 * No-ops (ok + skipped) when Pixel ID / access token are missing.
 */
export async function sendMetaCapiEvent(
  input: MetaCapiEventInput,
): Promise<MetaCapiSendResult> {
  const config = getMetaCapiConfig();
  if (!config) {
    return {
      ok: true,
      skipped: true,
      reason: "META_ACCESS_TOKEN or NEXT_PUBLIC_META_PIXEL_ID is not configured",
    };
  }

  const event_id = input.event_id.trim();
  if (!event_id) {
    return { ok: false, error: "event_id is required" };
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.event_name,
        event_time: input.event_time ?? Math.floor(Date.now() / 1000),
        event_id,
        action_source: "website",
        ...(input.event_source_url
          ? { event_source_url: input.event_source_url }
          : {}),
        user_data: buildUserData(input.user_data),
        ...(input.custom_data ? { custom_data: input.custom_data } : {}),
      },
    ],
  };

  if (config.testEventCode) {
    payload.test_event_code = config.testEventCode;
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.pixelId}/events?access_token=${encodeURIComponent(config.accessToken)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as {
      events_received?: number;
      error?: { message?: string };
    } | null;

    if (!response.ok) {
      const message =
        body?.error?.message ?? `Meta CAPI HTTP ${response.status}`;
      console.error("[Meta CAPI]", message);
      return { ok: false, error: message, status: response.status };
    }

    return {
      ok: true,
      events_received: body?.events_received,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Meta CAPI request failed";
    console.error("[Meta CAPI]", message);
    return { ok: false, error: message };
  }
}

type PurchaseOrderLike = {
  orderNumber: string;
  total: { toString(): string } | number;
  currency: string;
  guestEmail?: string | null;
  shippingAddress: unknown;
  items: { productId: string }[];
};

function appBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
}

/**
 * Purchase CAPI from order confirmation.
 * `event_id` === `order.orderNumber` (same as Pixel `eventID`).
 */
export async function sendMetaPurchaseCapi(order: PurchaseOrderLike): Promise<MetaCapiSendResult> {
  const context = await getMetaCapiRequestContext();
  const shipping = (order.shippingAddress ?? {}) as StoredShippingAddress;
  const base = appBaseUrl();

  return sendMetaCapiEvent({
    event_name: "Purchase",
    event_id: order.orderNumber,
    event_source_url: base
      ? `${base}/checkout/confirmation/${order.orderNumber}`
      : undefined,
    user_data: {
      email: order.guestEmail,
      phone: shipping.phone,
      ...context,
    },
    custom_data: {
      value: Number(order.total),
      currency: order.currency,
      content_ids: order.items.map((item) => item.productId),
      content_type: "product",
      num_items: order.items.length,
    },
  });
}

/** InitiateCheckout — `event_id` must match Pixel (`ic_{cartId}`). */
export async function sendMetaInitiateCheckoutCapi(input: {
  eventId: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems: number;
  email?: string | null;
  phone?: string | null;
}): Promise<MetaCapiSendResult> {
  const context = await getMetaCapiRequestContext();
  const base = appBaseUrl();

  return sendMetaCapiEvent({
    event_name: "InitiateCheckout",
    event_id: input.eventId,
    event_source_url: base ? `${base}/checkout/information` : undefined,
    user_data: {
      email: input.email,
      phone: input.phone,
      ...context,
    },
    custom_data: {
      value: input.value,
      currency: input.currency,
      content_ids: input.contentIds,
      content_type: "product",
      num_items: input.numItems,
    },
  });
}

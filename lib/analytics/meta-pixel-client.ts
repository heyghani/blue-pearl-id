"use client";

/**
 * Browser-side Meta Pixel helpers (shared by Purchase / funnel events).
 */

export function whenFbqReady(callback: () => void, timeoutMs = 10_000) {
  if (typeof window === "undefined") return () => {};

  if (typeof window.fbq === "function") {
    callback();
    return () => {};
  }

  const started = Date.now();
  const id = window.setInterval(() => {
    if (typeof window.fbq === "function") {
      window.clearInterval(id);
      callback();
      return;
    }
    if (Date.now() - started >= timeoutMs) {
      window.clearInterval(id);
    }
  }, 200);

  return () => window.clearInterval(id);
}

export function trackMetaPixelEvent(
  eventName: string,
  params: Record<string, unknown>,
  eventId: string,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, params, { eventID: eventId });
}

export type MetaCapiBrowserPayload = {
  event_name: string;
  event_id: string;
  event_source_url?: string;
  user_data?: {
    email?: string;
    phone?: string;
  };
  custom_data?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
  };
};

/** POST to /api/meta-capi — same event_id as Pixel for dedup. */
export async function sendMetaCapiBrowser(payload: MetaCapiBrowserPayload) {
  try {
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        event_source_url:
          payload.event_source_url ??
          (typeof window !== "undefined" ? window.location.href : undefined),
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error("[Meta CAPI] browser send failed:", error);
  }
}

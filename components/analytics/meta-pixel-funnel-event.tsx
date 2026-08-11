"use client";

import { useEffect, useRef } from "react";

import {
  sendMetaCapiBrowser,
  trackMetaPixelEvent,
  whenFbqReady,
} from "@/lib/analytics/meta-pixel-client";

type Props = {
  eventName: string;
  eventId: string;
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  numItems?: number;
  /** Also POST to /api/meta-capi with the same event_id (default true). */
  sendCapi?: boolean;
};

/** Fire Meta Pixel (+ optional CAPI) once on mount for funnel events. */
export function MetaPixelFunnelEvent({
  eventName,
  eventId,
  value,
  currency,
  contentIds,
  contentType = "product",
  numItems,
  sendCapi = true,
}: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    return whenFbqReady(() => {
      if (tracked.current) return;
      tracked.current = true;

      const params: Record<string, unknown> = {
        ...(value !== undefined ? { value } : {}),
        ...(currency ? { currency } : {}),
        ...(contentIds?.length
          ? {
              content_ids: contentIds,
              content_type: contentType,
              num_items: numItems ?? contentIds.length,
            }
          : {}),
      };

      trackMetaPixelEvent(eventName, params, eventId);

      if (sendCapi) {
        void sendMetaCapiBrowser({
          event_name: eventName,
          event_id: eventId,
          custom_data: {
            value,
            currency,
            content_ids: contentIds,
            content_type: contentIds?.length ? contentType : undefined,
            num_items: contentIds?.length
              ? (numItems ?? contentIds.length)
              : undefined,
          },
        });
      }
    });
  }, [
    eventName,
    eventId,
    value,
    currency,
    contentIds,
    contentType,
    numItems,
    sendCapi,
  ]);

  return null;
}

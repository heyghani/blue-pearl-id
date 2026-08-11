"use client";

import { useEffect, useRef } from "react";

import {
  trackMetaPixelEvent,
  whenFbqReady,
} from "@/lib/analytics/meta-pixel-client";

type Props = {
  orderNumber: string;
  value: number;
  currency: string;
  contentIds: string[];
};

export function MetaPixelPurchase({
  orderNumber,
  value,
  currency,
  contentIds,
}: Props) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    return whenFbqReady(() => {
      if (tracked.current || !window.fbq) return;

      tracked.current = true;
      trackMetaPixelEvent(
        "Purchase",
        {
          value,
          currency,
          content_ids: contentIds,
          content_type: "product",
          num_items: contentIds.length,
        },
        orderNumber,
      );
    });
  }, [orderNumber, value, currency, contentIds]);

  return null;
}

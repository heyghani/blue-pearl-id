"use client";

import { useEffect, useRef } from "react";

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
    if (tracked.current || !window.fbq) return;

    tracked.current = true;
    window.fbq(
      "track",
      "Purchase",
      {
        value,
        currency,
        content_ids: contentIds,
        content_type: "product",
        num_items: contentIds.length,
      },
      { eventID: orderNumber },
    );
  }, [orderNumber, value, currency, contentIds]);

  return null;
}

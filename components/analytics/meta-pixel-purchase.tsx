"use client";

import { useEffect, useRef } from "react";

type Props = {
  orderNumber: string;
  value: number;
  currency: string;
  contentIds: string[];
};

function whenFbqReady(callback: () => void, timeoutMs = 10_000) {
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
    });
  }, [orderNumber, value, currency, contentIds]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const DEBOUNCE_MS = 30_000;

export function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const now = Date.now();
    const previous = lastTracked.current;

    if (previous?.path === pathname && now - previous.at < DEBOUNCE_MS) {
      return;
    }

    lastTracked.current = { path: pathname, at: now };

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/pageview", blob);
      return;
    }

    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}

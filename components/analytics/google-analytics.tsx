"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

function buildPagePath(pathname: string, searchParams: URLSearchParams | null) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function whenGtagReady(callback: () => void, timeoutMs = 10_000) {
  if (typeof window === "undefined") return () => {};

  if (typeof window.gtag === "function") {
    callback();
    return () => {};
  }

  const started = Date.now();
  const id = window.setInterval(() => {
    if (typeof window.gtag === "function") {
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

function GoogleAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || !pathname) return;

    const pagePath = buildPagePath(pathname, searchParams);
    return whenGtagReady(() => {
      window.gtag?.("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
      <GoogleAnalyticsTracker />
    </>
  );
}

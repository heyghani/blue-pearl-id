"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import type { MetaAdvancedMatching } from "@/lib/analytics/meta-advanced-matching";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();

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

function MetaPixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID || !pathname) return;

    return whenFbqReady(() => {
      window.fbq?.("track", "PageView");
    });
  }, [pathname]);

  return null;
}

function buildInitCall(advancedMatching?: MetaAdvancedMatching) {
  const params: MetaAdvancedMatching = {};
  if (advancedMatching?.em) params.em = advancedMatching.em;
  if (advancedMatching?.ph) params.ph = advancedMatching.ph;

  if (Object.keys(params).length === 0) {
    return `fbq('init', '${PIXEL_ID}');`;
  }

  return `fbq('init', '${PIXEL_ID}', ${JSON.stringify(params)});`;
}

type Props = {
  advancedMatching?: MetaAdvancedMatching;
};

export function MetaPixel({ advancedMatching }: Props) {
  useEffect(() => {
    if (!PIXEL_ID) {
      console.warn(
        "[Meta Pixel] NEXT_PUBLIC_META_PIXEL_ID is missing or empty. " +
          "Browser Pixel events will not fire. Set it in Vercel → Project → Settings → Environment Variables (Production), then redeploy.",
      );
    }
  }, []);

  if (!PIXEL_ID) {
    return null;
  }

  const initCall = buildInitCall(advancedMatching);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          ${initCall}
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <MetaPixelTracker />
    </>
  );
}

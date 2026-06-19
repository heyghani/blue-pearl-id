"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

import { checkoutCopy } from "@/lib/copy";
import { formatIdr, formatUsdToIdrRate } from "@/lib/payments/usd-idr";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type PaymentSession =
  | { status: "completed"; orderNumber: string }
  | {
      status: "ready";
      provider: "midtrans";
      snapToken: string;
      clientKey: string;
      orderNumber: string;
      isSandbox: boolean;
      redirectUrl?: string;
      chargedAmountIdr?: number;
      exchangeRate?: number;
      rateSource?: string;
      rateFetchedAt?: string;
    }
  | {
      status: "ready";
      provider: "paypal";
      approvalUrl: string;
      orderNumber: string;
    }
  | {
      status: "unconfigured";
      provider: "midtrans" | "paypal";
      message: string;
    };

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: unknown) => void;
          onPending: (result: unknown) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        },
      ) => void;
    };
  }
}

export function PaymentCheckout({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapScriptReady, setSnapScriptReady] = useState(false);
  const [needsManualOpen, setNeedsManualOpen] = useState(false);
  const snapOpened = useRef(false);

  const openSnap = useCallback(
    (token: string, redirectUrl?: string) => {
      if (snapOpened.current) return;
      snapOpened.current = true;

      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: () => pollAndRedirect(orderNumber, router),
          onPending: () => pollAndRedirect(orderNumber, router),
          onError: () => router.push(`/payment/failed?order=${orderNumber}`),
          onClose: () => {
            snapOpened.current = false;
            setNeedsManualOpen(true);
          },
        });
        return;
      }

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      snapOpened.current = false;
      setNeedsManualOpen(true);
    },
    [orderNumber, router],
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/payments/session?order=${orderNumber}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error?.message ?? "Could not start payment.");
          return;
        }
        setSession(json.data);
        if (json.data.status === "completed") {
          router.replace(`/checkout/confirmation/${orderNumber}`);
        }
      } catch {
        setError("Could not start payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderNumber, router]);

  useEffect(() => {
    if (!session || session.status !== "ready") return;

    if (session.provider === "paypal") {
      window.location.href = session.approvalUrl;
      return;
    }

    if (session.provider === "midtrans" && snapScriptReady) {
      openSnap(session.snapToken, session.redirectUrl);
    }
  }, [session, snapScriptReady, openSnap]);

  // Fallback if Snap.js is slow or blocked
  useEffect(() => {
    if (!session || session.status !== "ready" || session.provider !== "midtrans") {
      return;
    }
    if (snapOpened.current || needsManualOpen) return;

    const timer = window.setTimeout(() => {
      if (!snapOpened.current) {
        setNeedsManualOpen(true);
      }
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [session, needsManualOpen]);

  const snapScript =
    session?.status === "ready" && session.provider === "midtrans"
      ? session.isSandbox
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
        : "https://app.midtrans.com/snap/snap.js"
      : null;

  const clientKey =
    session?.status === "ready" && session.provider === "midtrans"
      ? session.clientKey
      : undefined;

  if (loading) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {checkoutCopy.openingPayment}
      </p>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (session?.status === "unconfigured") {
    return (
      <div className="space-y-4 rounded-lg border border-dashed p-4 text-sm">
        <p className="font-medium text-foreground">Payment not configured</p>
        <p className="text-muted-foreground">{session.message}</p>
        <Button variant="outline" onClick={() => router.push(`/checkout/confirmation/${orderNumber}`)}>
          View order status
        </Button>
      </div>
    );
  }

  const idrNote =
    session?.status === "ready" &&
    session.provider === "midtrans" &&
    session.chargedAmountIdr
      ? formatIdr(session.chargedAmountIdr)
      : null;

  return (
    <>
      {snapScript && clientKey && (
        <Script
          src={snapScript}
          data-client-key={clientKey}
          strategy="afterInteractive"
          onReady={() => setSnapScriptReady(true)}
          onLoad={() => setSnapScriptReady(true)}
        />
      )}

      <div className="space-y-4 text-center text-sm">
        {idrNote ? (
          <p className="rounded-lg border bg-muted/40 px-4 py-3 text-muted-foreground">
            Card charge: <strong className="text-foreground">{idrNote}</strong>
            {session.status === "ready" &&
            session.provider === "midtrans" &&
            session.exchangeRate ? (
              <span className="mt-2 block text-xs">
                1 USD = Rp {formatUsdToIdrRate(session.exchangeRate)}
                {session.rateSource === "frankfurter" ? " · live rate" : " · fallback rate"}
                {session.rateFetchedAt
                  ? ` · ${new Date(session.rateFetchedAt).toLocaleString()}`
                  : ""}
              </span>
            ) : (
              <span className="mt-1 block text-xs">{checkoutCopy.processingCardNote}</span>
            )}
          </p>
        ) : null}

        {!needsManualOpen ? (
          <p className="text-muted-foreground">{checkoutCopy.openingPayment}</p>
        ) : (
          <>
            <p className="text-muted-foreground">
              Payment window did not open automatically. Click below to continue.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                if (session?.status === "ready" && session.provider === "midtrans") {
                  snapOpened.current = false;
                  openSnap(session.snapToken, session.redirectUrl);
                }
              }}
            >
              Continue to payment
            </Button>
          </>
        )}
      </div>
    </>
  );
}

async function pollAndRedirect(
  orderNumber: string,
  router: ReturnType<typeof useRouter>,
) {
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`/api/orders/${orderNumber}`);
    const json = await res.json();
    if (json.data?.status === "PAID") {
      router.push(`/checkout/confirmation/${orderNumber}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  router.push(`/checkout/confirmation/${orderNumber}`);
}

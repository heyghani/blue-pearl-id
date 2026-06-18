"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

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
  const snapOpened = useRef(false);

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

    if (
      session.provider === "midtrans" &&
      window.snap &&
      !snapOpened.current
    ) {
      snapOpened.current = true;
      window.snap.pay(session.snapToken, {
        onSuccess: () => pollAndRedirect(orderNumber, router),
        onPending: () => pollAndRedirect(orderNumber, router),
        onError: () =>
          router.push(`/payment/failed?order=${orderNumber}`),
        onClose: () => {
          router.push(`/payment/failed?order=${orderNumber}`);
        },
      });
    }
  }, [session, orderNumber, router]);

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
    return <p className="text-center text-sm text-muted-foreground">Preparing secure payment…</p>;
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
        <p className="font-medium text-foreground">Payment gateway not configured</p>
        <p className="text-muted-foreground">{session.message}</p>
        <p className="text-muted-foreground">
          Add your {session.provider === "midtrans" ? "Midtrans" : "PayPal"} API keys to{" "}
          <code className="text-xs">.env</code> and restart the server. See{" "}
          <code className="text-xs">docs/PAYMENT-SETUP.md</code>.
        </p>
        <Button variant="outline" onClick={() => router.push(`/checkout/confirmation/${orderNumber}`)}>
          View order status
        </Button>
      </div>
    );
  }

  return (
    <>
      {snapScript && clientKey && (
        <Script src={snapScript} data-client-key={clientKey} strategy="afterInteractive" />
      )}
      <p className="text-center text-sm text-muted-foreground">
        {session?.status === "ready" && session.provider === "paypal"
          ? "Redirecting to PayPal…"
          : "Opening secure payment window…"}
      </p>
      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (session?.status === "ready" && session.provider === "midtrans" && window.snap) {
              snapOpened.current = true;
              window.snap.pay(session.snapToken, {
                onSuccess: () => pollAndRedirect(orderNumber, router),
                onPending: () => pollAndRedirect(orderNumber, router),
                onError: () => router.push(`/payment/failed?order=${orderNumber}`),
                onClose: () => router.push(`/payment/failed?order=${orderNumber}`),
              });
            }
          }}
        >
          Open payment window
        </Button>
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

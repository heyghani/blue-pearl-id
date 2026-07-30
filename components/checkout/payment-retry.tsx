"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ENABLE_CREDIT_CARD_PAYMENT,
  ENABLE_USDT_PAYMENT,
  SUPPORT_EMAIL,
} from "@/lib/constants";

type RetryMethod = "CREDIT_CARD" | "PAYPAL" | "USDT";

export function PaymentRetry({
  orderNumber,
  defaultMethod,
}: {
  orderNumber: string;
  defaultMethod: RetryMethod;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function retry(method: RetryMethod) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          paymentMethod: method,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Retry failed.");
        return;
      }

      router.push(`/checkout/processing?order=${orderNumber}`);
    } catch {
      setError("Retry failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment unsuccessful</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your order <strong>{orderNumber}</strong> was saved. No charge was completed.
          You can try again with the same or a different payment method.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {ENABLE_CREDIT_CARD_PAYMENT ? (
            <Button
              disabled={loading}
              onClick={() => retry("CREDIT_CARD")}
              variant={defaultMethod === "CREDIT_CARD" ? "default" : "outline"}
            >
              Try card again
            </Button>
          ) : null}
          <Button
            disabled={loading}
            onClick={() => retry("PAYPAL")}
            variant={defaultMethod === "PAYPAL" ? "default" : "outline"}
          >
            Try PayPal
          </Button>
          {ENABLE_USDT_PAYMENT ? (
            <Button
              disabled={loading}
              onClick={() => retry("USDT")}
              variant={defaultMethod === "USDT" ? "default" : "outline"}
            >
              Try USDT
            </Button>
          ) : null}
        </div>

        <Button variant="link" className="px-0" asChild>
          <Link href={`mailto:${SUPPORT_EMAIL}?subject=Payment%20help%20${orderNumber}`}>
            Contact support
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

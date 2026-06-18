"use client";

import Link from "next/link";
import { useActionState, useMemo } from "react";

import {
  placeOrderAction,
  type CheckoutActionState,
} from "@/lib/actions/checkout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: CheckoutActionState = {};

export function PaymentForm({
  defaultCoupon = "",
  email,
}: {
  defaultCoupon?: string;
  email: string;
}) {
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground">{email}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Payment method</h2>
        <div className="space-y-3">
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-4",
              "has-[:checked]:border-primary has-[:checked]:bg-muted/30",
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="CREDIT_CARD"
              defaultChecked
              required
            />
            <div>
              <p className="font-medium">Credit / Debit Card</p>
              <p className="text-sm text-muted-foreground">
                Secure payment via Midtrans
              </p>
            </div>
          </label>
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-4",
              "has-[:checked]:border-primary has-[:checked]:bg-muted/30",
            )}
          >
            <input type="radio" name="paymentMethod" value="PAYPAL" />
            <div>
              <p className="font-medium">PayPal</p>
              <p className="text-sm text-muted-foreground">
                Pay with your PayPal account
              </p>
            </div>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="couponCode">Coupon code (optional)</Label>
          <Input
            id="couponCode"
            name="couponCode"
            defaultValue={defaultCoupon}
            placeholder="Enter code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="Special instructions for your order"
          />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/checkout/shipping">Back</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Placing order…" : "Place order & pay"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { CheckoutSecureNotice } from "@/components/checkout/checkout-secure-notice";
import {
  CardMark,
  MidtransMark,
  PayPalMark,
} from "@/components/checkout/payment-method-icons";
import { OrderReferenceFields } from "@/components/checkout/order-reference-fields";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  placeOrderAction,
  type CheckoutActionState,
} from "@/lib/actions/checkout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ENABLE_CREDIT_CARD_PAYMENT,
  ENABLE_USDT_PAYMENT,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const initialState: CheckoutActionState = {};

function defaultPaymentMethod(): "CREDIT_CARD" | "PAYPAL" | "USDT" {
  if (ENABLE_CREDIT_CARD_PAYMENT) return "CREDIT_CARD";
  if (ENABLE_USDT_PAYMENT) return "USDT";
  return "PAYPAL";
}

export function PaymentForm({
  defaultCoupon = "",
  defaultOrderReferencePhotoUrl = "",
  defaultOrderDimensions = "",
  email,
}: {
  defaultCoupon?: string;
  defaultOrderReferencePhotoUrl?: string;
  defaultOrderDimensions?: string;
  email: string;
}) {
  const t = useTranslations();
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const [referenceUploading, setReferenceUploading] = useState(false);
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialState,
  );
  const selectedDefault = defaultPaymentMethod();

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {t.checkout.contactSectionTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{email}</p>
      </section>

      <OrderReferenceFields
        defaultPhotoUrl={defaultOrderReferencePhotoUrl}
        defaultDimensions={defaultOrderDimensions}
        fieldErrors={state.fieldErrors}
        onUploadingChange={setReferenceUploading}
      />

      <section className="space-y-4">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {t.checkout.paymentMethodTitle}
        </h2>
        <div className="space-y-3">
          {ENABLE_CREDIT_CARD_PAYMENT ? (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-4 transition-colors",
                "has-[:checked]:border-verified-green has-[:checked]:bg-verified-green/5",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="CREDIT_CARD"
                defaultChecked={selectedDefault === "CREDIT_CARD"}
                required
                className="accent-verified-green"
              />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{t.checkout.creditCardTitle}</p>
                  <p className="text-sm text-muted-foreground">{t.checkout.creditCardDesc}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <CardMark />
                  <MidtransMark />
                </div>
              </div>
            </label>
          ) : null}
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-4 transition-colors",
              "has-[:checked]:border-verified-green has-[:checked]:bg-verified-green/5",
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="PAYPAL"
              defaultChecked={selectedDefault === "PAYPAL"}
              required
              className="accent-verified-green"
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div>
                <p className="font-medium">{t.checkout.paypalTitle}</p>
                <p className="text-sm text-muted-foreground">{t.checkout.paypalDesc}</p>
              </div>
              <PayPalMark className="shrink-0" />
            </div>
          </label>
          {ENABLE_USDT_PAYMENT ? (
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-4 transition-colors",
                "has-[:checked]:border-verified-green has-[:checked]:bg-verified-green/5",
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="USDT"
                defaultChecked={selectedDefault === "USDT"}
                required
                className="accent-verified-green"
              />
              <div>
                <p className="font-medium">{t.checkout.usdtTitle}</p>
                <p className="text-sm text-muted-foreground">{t.checkout.usdtDesc}</p>
              </div>
            </label>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="couponCode">{t.checkout.couponLabel}</Label>
          <Input
            id="couponCode"
            name="couponCode"
            defaultValue={defaultCoupon}
            placeholder={t.checkout.couponPlaceholder}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">{t.checkout.notesLabel}</Label>
          <Input
            id="notes"
            name="notes"
            placeholder={t.checkout.notesPlaceholder}
          />
        </div>
      </section>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" className="rounded-md" asChild>
            <Link href="/checkout/shipping">{t.checkout.back}</Link>
          </Button>
          <Button
            type="submit"
            size="lg"
            className="rounded-md font-display text-sm font-semibold uppercase tracking-wide"
            disabled={pending || referenceUploading}
          >
            {pending
              ? t.checkout.placingOrder
              : referenceUploading
                ? t.checkout.uploadingPhoto
                : t.checkout.placeOrderPay}
          </Button>
        </div>
        <CheckoutSecureNotice />
      </div>
    </form>
  );
}

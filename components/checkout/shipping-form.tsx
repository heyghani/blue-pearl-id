"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ShippingMethodType } from "@prisma/client";

import { AddressFields } from "@/components/checkout/address-fields";
import { useTranslations } from "@/components/i18n/locale-provider";
import {
  saveShippingAction,
  type CheckoutActionState,
} from "@/lib/actions/checkout";
import type { AddressInput } from "@/lib/validations/checkout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";

const initialState: CheckoutActionState = {};

type ShippingRate = {
  method: ShippingMethodType;
  name: string;
  price: string;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
};

export function ShippingForm({
  defaultAddress,
  defaultMethod,
  rates,
}: {
  defaultAddress?: Partial<AddressInput>;
  defaultMethod?: ShippingMethodType;
  rates: ShippingRate[];
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(
    saveShippingAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping address</h2>
        <AddressFields
          defaultValues={defaultAddress}
          fieldErrors={state.fieldErrors}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shipping method</h2>
        <div className="space-y-3">
          {rates.map((rate) => (
            <label
              key={rate.method}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-4 transition-colors",
                "has-[:checked]:border-verified-green has-[:checked]:bg-verified-green/5",
              )}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={rate.method}
                defaultChecked={defaultMethod === rate.method || rates[0]?.method === rate.method}
                className="mt-1"
                required
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{rate.name}</span>
                  <Price amount={rate.price} />
                </div>
                {rate.estimatedDaysMin != null && rate.estimatedDaysMax != null && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rate.estimatedDaysMin}–{rate.estimatedDaysMax} business days
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" className="rounded-md" asChild>
          <Link href="/checkout/information">{t.checkout.back}</Link>
        </Button>
        <Button type="submit" className="rounded-md font-display uppercase tracking-wide" disabled={pending}>
          {pending ? t.checkout.continuing : t.checkout.continueToPayment}
        </Button>
      </div>
    </form>
  );
}

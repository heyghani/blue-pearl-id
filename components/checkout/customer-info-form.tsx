"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  saveCustomerInfoAction,
  type CheckoutActionState,
} from "@/lib/actions/checkout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CheckoutActionState = {};

export function CustomerInfoForm({
  defaultEmail = "",
  defaultPhone = "",
}: {
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveCustomerInfoAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          required
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Order confirmation and tracking will be sent here.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={defaultPhone}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" asChild>
          <Link href="/cart">Return to cart</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Continuing…" : "Continue to shipping"}
        </Button>
      </div>
    </form>
  );
}

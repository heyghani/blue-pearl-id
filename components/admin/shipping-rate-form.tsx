"use client";

import { ShippingMethodType } from "@prisma/client";
import { useActionState } from "react";

import {
  updateShippingRateAction,
  type AdminActionState,
} from "@/lib/actions/admin/shipping";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

export function ShippingRateForm({
  method,
  name,
  price,
  estimatedDaysMin,
  estimatedDaysMax,
  isActive,
}: {
  method: ShippingMethodType;
  name: string;
  price: string;
  estimatedDaysMin?: number | null;
  estimatedDaysMax?: number | null;
  isActive: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateShippingRateAction.bind(null, method),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">{method}</p>
      </div>

      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${method}-price`}>Price (USD)</Label>
          <Input
            id={`${method}-price`}
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={price}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${method}-min`}>Min days</Label>
          <Input
            id={`${method}-min`}
            name="estimatedDaysMin"
            type="number"
            min="1"
            defaultValue={estimatedDaysMin ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${method}-max`}>Max days</Label>
          <Input
            id={`${method}-max`}
            name="estimatedDaysMax"
            type="number"
            min="1"
            defaultValue={estimatedDaysMax ?? ""}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={isActive}
          className="rounded border-input"
        />
        Active at checkout
      </label>

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Save rate"}
      </Button>
    </form>
  );
}

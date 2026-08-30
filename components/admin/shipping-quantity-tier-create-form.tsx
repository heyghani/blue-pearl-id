"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createShippingQuantityTierAction,
  type AdminActionState,
} from "@/lib/actions/admin/shipping";

const initialState: AdminActionState = {};

export function ShippingQuantityTierCreateForm({
  defaultStandardPrice,
  defaultExpressPrice,
}: {
  defaultStandardPrice: string;
  defaultExpressPrice: string;
}) {
  const [state, formAction, pending] = useActionState(
    createShippingQuantityTierAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-dashed p-4">
      <div>
        <h3 className="font-medium">Add a custom quantity</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter any pack size (for example 8 or 100 pairs) and the Standard /
          Express shipping price for that quantity.
        </p>
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

      {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            {Object.values(state.fieldErrors)
              .flat()
              .join(" ")}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="new-quantity">Pairs</Label>
          <Input
            id="new-quantity"
            name="quantity"
            type="number"
            min={1}
            max={999}
            placeholder="e.g. 8"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-standard">Standard (USD)</Label>
          <Input
            id="new-standard"
            name="standardPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultStandardPrice}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-express">Express (USD)</Label>
          <Input
            id="new-express"
            name="expressPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultExpressPrice}
            required
          />
        </div>
      </div>

      <input type="hidden" name="isActive" value="on" />

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Adding…" : "Add quantity pack"}
      </Button>
    </form>
  );
}

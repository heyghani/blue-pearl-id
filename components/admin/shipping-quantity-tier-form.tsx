"use client";

import { useActionState } from "react";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteShippingQuantityTierAction,
  updateShippingQuantityTierAction,
  type AdminActionState,
} from "@/lib/actions/admin/shipping";

const initialState: AdminActionState = {};

export function ShippingQuantityTierForm({
  id,
  quantity,
  standardPrice,
  expressPrice,
  isActive,
}: {
  id: string;
  quantity: number;
  standardPrice: string;
  expressPrice: string;
  isActive: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateShippingQuantityTierAction.bind(null, id),
    initialState,
  );

  return (
    <div className="space-y-4 rounded-lg border p-4">
    <form id={`${id}-form`} action={formAction} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">
          {quantity} {quantity === 1 ? "pair" : "pairs"}
        </h3>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
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
          <Label htmlFor={`${id}-quantity`}>Pairs</Label>
          <Input
            id={`${id}-quantity`}
            name="quantity"
            type="number"
            min={1}
            max={999}
            defaultValue={quantity}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-standard`}>Standard (USD)</Label>
          <Input
            id={`${id}-standard`}
            name="standardPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={standardPrice}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-express`}>Express (USD)</Label>
          <Input
            id={`${id}-express`}
            name="expressPrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={expressPrice}
            required
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
        Show on product pages
      </label>
    </form>
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" form={`${id}-form`} disabled={pending} size="sm">
        {pending ? "Saving…" : "Save pack"}
      </Button>
      <ConfirmDeleteForm
        action={deleteShippingQuantityTierAction}
        id={id}
        label="Remove"
        confirmMessage={`Remove the ${quantity}-pair pack? Customers will no longer see this quantity.`}
      />
    </div>
    </div>
  );
}

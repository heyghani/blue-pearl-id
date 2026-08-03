"use client";

import { useActionState, useEffect, useState } from "react";

import {
  updateDefaultBasePriceAction,
  type AdminActionState,
} from "@/lib/actions/admin/store-settings";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

export function DefaultBasePriceForm({
  defaultBasePrice,
}: {
  defaultBasePrice: number;
}) {
  const [value, setValue] = useState(String(defaultBasePrice));
  const [state, formAction, pending] = useActionState(
    updateDefaultBasePriceAction,
    initialState,
  );

  useEffect(() => {
    if (typeof state.defaultBasePrice === "number") {
      setValue(String(state.defaultBasePrice));
    }
  }, [state.defaultBasePrice]);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
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

      {state.fieldErrors?.defaultBasePrice?.[0] && (
        <Alert variant="destructive">
          <AlertDescription>
            {state.fieldErrors.defaultBasePrice[0]}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="defaultBasePrice">Default base price (USD)</Label>
        <Input
          id="defaultBasePrice"
          name="defaultBasePrice"
          type="number"
          step="0.01"
          min="0"
          value={value}
          required
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Prefills the base price when creating a new product. You can also
          update it from the new product form.
        </p>
      </div>

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving…" : "Save default price"}
      </Button>
    </form>
  );
}

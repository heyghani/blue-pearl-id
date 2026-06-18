"use client";

import { useActionState } from "react";

import {
  createRefundAction,
  type AdminActionState,
} from "@/lib/actions/admin/orders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

export function RefundForm({
  paymentId,
  maxAmount,
}: {
  paymentId: string;
  maxAmount: string;
}) {
  const [state, formAction, pending] = useActionState(
    createRefundAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">Issue refund</h3>
      <p className="text-sm text-muted-foreground">
        Records the refund in Blue Pearl ID. Complete the actual refund in Midtrans or PayPal.
      </p>

      <input type="hidden" name="paymentId" value={paymentId} />

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

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={maxAmount}
          defaultValue={maxAmount}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" name="reason" placeholder="Customer request" />
      </div>

      <Button type="submit" disabled={pending} size="sm" variant="outline">
        {pending ? "Processing…" : "Record refund"}
      </Button>
    </form>
  );
}

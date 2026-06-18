"use client";

import { OrderStatus } from "@prisma/client";
import { useActionState } from "react";

import {
  updateOrderStatusAction,
  type AdminActionState,
} from "@/lib/actions/admin/orders";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AdminActionState = {};

const adminStatuses: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

export function OrderStatusForm({
  orderId,
  currentStatus,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderStatusAction.bind(null, orderId),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <h3 className="font-medium">Update status</h3>

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
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value={currentStatus} disabled>
            Current: {currentStatus.toLowerCase().replace(/_/g, " ")}
          </option>
          {adminStatuses.map((status) => (
            <option key={status} value={status}>
              {status.toLowerCase().replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="trackingNumber">Tracking number</Label>
          <Input
            id="trackingNumber"
            name="trackingNumber"
            defaultValue={trackingNumber ?? ""}
            placeholder="Required when shipping"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carrier">Carrier</Label>
          <Input
            id="carrier"
            name="carrier"
            defaultValue={carrier ?? ""}
            placeholder="UPS, DHL, FedEx…"
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Updating…" : "Update order"}
      </Button>
    </form>
  );
}

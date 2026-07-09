import { extractPayPalPayerInfo } from "@/lib/payments/paypal-payer";
import { Price } from "@/components/shared/price";
import type { Payment, Refund } from "@prisma/client";

type PaymentWithRefunds = Payment & { refunds: Refund[] };

export function AdminPaymentDetails({
  payments,
}: {
  payments: PaymentWithRefunds[];
}) {
  return (
    <ul className="mt-4 space-y-4 text-sm">
      {payments.map((payment) => {
        const payer =
          payment.provider === "PAYPAL"
            ? extractPayPalPayerInfo(payment.rawResponse)
            : null;

        return (
          <li key={payment.id} className="rounded-md border bg-muted/20 p-3">
            <div className="flex justify-between gap-4">
              <span className="capitalize text-muted-foreground">
                {payment.provider.toLowerCase()} ·{" "}
                {payment.method.toLowerCase().replace(/_/g, " ")}
              </span>
              <span>
                {payment.status.toLowerCase()} ·{" "}
                <Price amount={payment.amount.toString()} />
              </span>
            </div>

            <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
              {payer?.name ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-medium text-foreground">Payer name</dt>
                  <dd>{payer.name}</dd>
                </div>
              ) : null}
              {payer?.email ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-medium text-foreground">Payer email</dt>
                  <dd>{payer.email}</dd>
                </div>
              ) : null}
              {payment.transactionId ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-medium text-foreground">Transaction ID</dt>
                  <dd className="break-all font-mono">{payment.transactionId}</dd>
                </div>
              ) : null}
              {payment.externalId ? (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-medium text-foreground">External ID</dt>
                  <dd className="break-all font-mono">{payment.externalId}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

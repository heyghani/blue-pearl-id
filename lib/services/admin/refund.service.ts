import { OrderStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function createRefund({
  paymentId,
  amount,
  reason,
  initiatedBy,
}: {
  paymentId: string;
  amount: number;
  reason?: string;
  initiatedBy: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true, refunds: true },
  });

  if (!payment) {
    return { error: "Payment not found." };
  }

  if (payment.status !== PaymentStatus.CAPTURED) {
    return { error: "Only captured payments can be refunded." };
  }

  const refundedTotal = payment.refunds
    .filter((refund) => refund.status === "COMPLETED" || refund.status === "PENDING")
    .reduce((sum, refund) => sum + Number(refund.amount), 0);

  const remaining = Number(payment.amount) - refundedTotal;

  if (amount > remaining) {
    return { error: `Maximum refundable amount is ${remaining.toFixed(2)}.` };
  }

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.refund.create({
      data: {
        paymentId,
        amount,
        reason: reason ?? null,
        status: "PENDING",
        initiatedBy,
      },
    });

    const isFullRefund = amount >= remaining;

    if (isFullRefund) {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.REFUNDED },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.REFUNDED },
      });
    } else {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.PARTIALLY_REFUNDED },
      });
    }

    return created;
  });

  // Gateway refund APIs (Midtrans/PayPal) are initiated manually in MVP;
  // mark as completed once verified in provider dashboard.
  await prisma.refund.update({
    where: { id: refund.id },
    data: { status: "COMPLETED" },
  });

  return { refund };
}

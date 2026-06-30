import {
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import {
  createMidtransSnapToken,
  getMidtransClientKey,
  isMidtransConfigured,
  mapMidtransStatus,
  type MidtransNotification,
  verifyMidtransSignature,
} from "@/lib/payments/midtrans";
import {
  capturePayPalOrder,
  createPayPalOrder,
  isPayPalConfigured,
} from "@/lib/payments/paypal";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/services/email.service";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function midtransExternalId(paymentId: string) {
  return paymentId;
}

function parseMidtransExternalId(externalId: string) {
  return { paymentId: externalId };
}

export async function initiatePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error("Payment not found.");
  }

  if (payment.status === PaymentStatus.CAPTURED) {
    return {
      status: "completed" as const,
      orderNumber: payment.order.orderNumber,
    };
  }

  if (payment.provider === PaymentProvider.MIDTRANS) {
    if (!isMidtransConfigured()) {
      return {
        status: "unconfigured" as const,
        provider: "midtrans" as const,
        message: "Midtrans API keys are not set.",
      };
    }

    if (payment.snapToken) {
      const meta = payment.rawResponse as {
        chargedAmountIdr?: number;
        exchangeRate?: number;
        rateSource?: string;
        rateFetchedAt?: string;
      } | null;
      return {
        status: "ready" as const,
        provider: "midtrans" as const,
        snapToken: payment.snapToken,
        clientKey: getMidtransClientKey(),
        orderNumber: payment.order.orderNumber,
        isSandbox: process.env.MIDTRANS_IS_PRODUCTION !== "true",
        redirectUrl: payment.redirectUrl ?? undefined,
        chargedAmountIdr: meta?.chargedAmountIdr,
        exchangeRate: meta?.exchangeRate,
        rateSource: meta?.rateSource,
        rateFetchedAt: meta?.rateFetchedAt,
      };
    }

    const externalId = midtransExternalId(payment.id);
    const shipping = payment.order.shippingAddress as {
      firstName?: string;
      lastName?: string;
      phone?: string;
    };

    const snap = await createMidtransSnapToken({
      orderId: externalId,
      orderNumber: payment.order.orderNumber,
      grossAmountUsd: Number(payment.amount),
      customer: {
        email:
          payment.order.guestEmail ??
          (await getUserEmail(payment.order.userId)) ??
          "customer@example.com",
        firstName: shipping.firstName ?? "Customer",
        lastName: shipping.lastName,
        phone: shipping.phone,
      },
    });

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          snapToken: snap.token,
          redirectUrl: snap.redirectUrl,
          externalId,
          rawResponse: {
            chargedAmountIdr: snap.grossAmountIdr,
            orderAmountUsd: snap.grossAmountUsd,
            exchangeRate: snap.exchangeQuote.rate,
            rateSource: snap.exchangeQuote.source,
            rateFetchedAt: snap.exchangeQuote.fetchedAt,
          },
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_PROCESSING },
      }),
    ]);

    return {
      status: "ready" as const,
      provider: "midtrans" as const,
      snapToken: snap.token,
      clientKey: getMidtransClientKey(),
      orderNumber: payment.order.orderNumber,
      isSandbox: process.env.MIDTRANS_IS_PRODUCTION !== "true",
      redirectUrl: snap.redirectUrl,
      chargedAmountIdr: snap.grossAmountIdr,
      exchangeRate: snap.exchangeQuote.rate,
      rateSource: snap.exchangeQuote.source,
      rateFetchedAt: snap.exchangeQuote.fetchedAt,
    };
  }

  if (payment.provider === PaymentProvider.PAYPAL) {
    if (!isPayPalConfigured()) {
      return {
        status: "unconfigured" as const,
        provider: "paypal" as const,
        message: "PayPal API credentials are not set.",
      };
    }

    if (payment.redirectUrl) {
      return {
        status: "ready" as const,
        provider: "paypal" as const,
        approvalUrl: payment.redirectUrl,
        orderNumber: payment.order.orderNumber,
      };
    }

    const paypalOrder = await createPayPalOrder({
      referenceId: payment.order.orderNumber,
      amount: Number(payment.amount).toFixed(2),
      currency: payment.currency,
      returnUrl: `${appUrl()}/api/payments/paypal/return?orderNumber=${payment.order.orderNumber}`,
      cancelUrl: `${appUrl()}/payment/failed?order=${payment.order.orderNumber}`,
    });

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalId: paypalOrder.id,
          redirectUrl: paypalOrder.approvalUrl,
        },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_PROCESSING },
      }),
    ]);

    return {
      status: "ready" as const,
      provider: "paypal" as const,
      approvalUrl: paypalOrder.approvalUrl,
      orderNumber: payment.order.orderNumber,
    };
  }

  throw new Error("Unsupported payment provider.");
}

async function getUserEmail(userId: string | null) {
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  return user?.email ?? null;
}

export async function syncPaymentFromMidtrans(notification: MidtransNotification) {
  if (!verifyMidtransSignature(notification)) {
    throw new Error("Invalid Midtrans signature.");
  }

  const mapped = mapMidtransStatus(notification);
  const { paymentId } = parseMidtransExternalId(notification.order_id);

  return applyPaymentUpdate({
    paymentId,
    provider: PaymentProvider.MIDTRANS,
    eventType: `webhook.${notification.transaction_status}`,
    mappedStatus: mapped,
    transactionId: notification.transaction_id,
    failureMessage: notification.status_message,
    payload: notification,
    signature: notification.signature_key,
  });
}

export async function syncPaymentFromPayPalCapture(
  paypalOrderId: string,
  orderNumber: string,
) {
  const payment = await prisma.payment.findFirst({
    where: {
      order: { orderNumber },
      provider: PaymentProvider.PAYPAL,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    throw new Error("PayPal payment not found.");
  }

  const capture = await capturePayPalOrder(paypalOrderId);
  const mapped = capture.status === "COMPLETED" ? "CAPTURED" : "FAILED";

  return applyPaymentUpdate({
    paymentId: payment.id,
    provider: PaymentProvider.PAYPAL,
    eventType: "capture.completed",
    mappedStatus: mapped,
    transactionId: capture.captureId,
    payload: capture.raw,
  });
}

type MappedStatus = "CAPTURED" | "PENDING" | "FAILED" | "EXPIRED" | "CANCELLED";

async function applyPaymentUpdate({
  paymentId,
  provider,
  eventType,
  mappedStatus,
  transactionId,
  failureMessage,
  payload,
  signature,
}: {
  paymentId: string;
  provider: PaymentProvider;
  eventType: string;
  mappedStatus: MappedStatus;
  transactionId?: string;
  failureMessage?: string;
  payload: unknown;
  signature?: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      throw new Error("Payment not found.");
    }

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType,
        provider,
        payload: payload as Prisma.InputJsonValue,
        signature,
        processed: false,
      },
    });

    if (payment.status === PaymentStatus.CAPTURED) {
      return {
        orderNumber: payment.order.orderNumber,
        status: "CAPTURED" as const,
        orderStatus: payment.order.status,
        orderId: payment.orderId,
        sendConfirmation: false,
      };
    }

    const paymentUpdate: Prisma.PaymentUpdateInput = {
      transactionId,
      rawResponse: payload as Prisma.InputJsonValue,
    };

    let orderStatus = payment.order.status;

    if (mappedStatus === "CAPTURED") {
      paymentUpdate.status = PaymentStatus.CAPTURED;
      paymentUpdate.capturedAt = new Date();
      orderStatus = OrderStatus.PAID;

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });

      for (const item of payment.order.items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }
    } else if (mappedStatus === "FAILED") {
      paymentUpdate.status = PaymentStatus.FAILED;
      paymentUpdate.failedAt = new Date();
      paymentUpdate.failureMessage = failureMessage;
      orderStatus = OrderStatus.PAYMENT_FAILED;
      await releaseReservedInventory(tx, payment.order.items);
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_FAILED },
      });
    } else if (mappedStatus === "EXPIRED") {
      paymentUpdate.status = PaymentStatus.EXPIRED;
      paymentUpdate.expiredAt = new Date();
      orderStatus = OrderStatus.EXPIRED;
      await releaseReservedInventory(tx, payment.order.items);
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.EXPIRED },
      });
    } else if (mappedStatus === "CANCELLED") {
      paymentUpdate.status = PaymentStatus.CANCELLED;
      orderStatus = OrderStatus.CANCELLED;
      await releaseReservedInventory(tx, payment.order.items);
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
      });
    } else {
      paymentUpdate.status = PaymentStatus.PENDING;
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_PROCESSING },
      });
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: paymentUpdate,
    });

    await tx.paymentEvent.updateMany({
      where: { paymentId: payment.id, eventType },
      data: { processed: true },
    });

    return {
      orderNumber: payment.order.orderNumber,
      status: mappedStatus,
      orderStatus,
      orderId: payment.orderId,
      sendConfirmation: mappedStatus === "CAPTURED",
    };
  });

  if (result.sendConfirmation) {
    void notifyOrderPaid(result.orderId);
  }

  return {
    orderNumber: result.orderNumber,
    status: result.status,
    orderStatus: result.orderStatus,
  };
}

async function notifyOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { email: true } },
    },
  });

  if (!order) return;

  const email = order.guestEmail ?? order.user?.email;
  if (!email) return;

  await sendOrderConfirmationEmail({
    email,
    orderNumber: order.orderNumber,
    total: order.total.toString(),
    currency: order.currency,
    items: order.items,
  });
}

async function releaseReservedInventory(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
) {
  for (const item of items) {
    await tx.inventory.updateMany({
      where: { productId: item.productId },
      data: { reservedQuantity: { decrement: item.quantity } },
    });
  }
}

export async function retryPayment({
  orderNumber,
  paymentMethod,
  idempotencyKey,
}: {
  orderNumber: string;
  paymentMethod: "CREDIT_CARD" | "PAYPAL";
  idempotencyKey: string;
}) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!order) {
    return { error: "Order not found." };
  }

  if (!["PENDING", "PAYMENT_FAILED", "EXPIRED"].includes(order.status)) {
    return { error: "This order cannot be retried." };
  }

  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey },
  });
  if (existing) {
    return { paymentId: existing.id, orderNumber };
  }

  const provider =
    paymentMethod === "CREDIT_CARD"
      ? PaymentProvider.MIDTRANS
      : PaymentProvider.PAYPAL;

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider,
      method: paymentMethod,
      status: PaymentStatus.PENDING,
      amount: order.total,
      currency: order.currency,
      idempotencyKey,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.PENDING },
  });

  return { paymentId: payment.id, orderNumber };
}

export async function getOrderPaymentStatus(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { status: true, orderNumber: true },
  });
  return order;
}

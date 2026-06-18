import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  ShippingMethodType,
} from "@prisma/client";

import { generateOrderNumber } from "@/lib/order-number";
import { prisma } from "@/lib/db";
import type { AddressInput } from "@/lib/validations/checkout";

export type CheckoutTotals = {
  subtotal: string;
  shipping: string;
  discount: string;
  tax: string;
  total: string;
  currency: string;
  shippingMethodName: string;
};

export type CreateOrderInput = {
  email: string;
  phone?: string;
  shippingAddress: AddressInput;
  billingAddress?: AddressInput;
  shippingMethod: ShippingMethodType;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  idempotencyKey: string;
  userId?: string;
  cartId: string;
};

export type CreateOrderResult =
  | {
      success: true;
      orderId: string;
      orderNumber: string;
      total: string;
      paymentId: string;
    }
  | { success: false; error: string };

async function getActiveShippingRate(method: ShippingMethodType) {
  return prisma.shippingRate.findFirst({
    where: { method, isActive: true },
  });
}

async function resolveCoupon(code?: string) {
  if (!code) return null;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon?.isActive) return null;

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return null;
  if (coupon.expiresAt && coupon.expiresAt < now) return null;
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) return null;

  return coupon;
}

function calculateDiscount(
  subtotal: number,
  coupon: {
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: Prisma.Decimal;
    minOrderAmount: Prisma.Decimal | null;
  } | null,
) {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return 0;
  }

  if (coupon.type === "PERCENTAGE") {
    return (subtotal * Number(coupon.value)) / 100;
  }

  return Math.min(subtotal, Number(coupon.value));
}

export async function calculateCheckoutTotals(
  cartItems: { productId: string; quantity: number }[],
  shippingMethod: ShippingMethodType,
  couponCode?: string,
): Promise<CheckoutTotals | { error: string }> {
  if (cartItems.length === 0) {
    return { error: "Your cart is empty." };
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: cartItems.map((i) => i.productId) },
      isActive: true,
      deletedAt: null,
    },
    include: { inventory: true },
  });

  if (products.length !== cartItems.length) {
    return { error: "Some items in your cart are no longer available." };
  }

  let subtotal = 0;
  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return { error: "Product not found." };

    const available = product.inventory
      ? product.inventory.quantity - product.inventory.reservedQuantity
      : 99;

    if (available < item.quantity) {
      return { error: `Not enough stock for ${product.name}.` };
    }

    subtotal += Number(product.price) * item.quantity;
  }

  const shippingRate = await getActiveShippingRate(shippingMethod);
  if (!shippingRate) {
    return { error: "Selected shipping method is unavailable." };
  }

  const coupon = await resolveCoupon(couponCode);
  const discount = calculateDiscount(subtotal, coupon);
  const shipping = Number(shippingRate.price);
  const tax = 0;
  const total = Math.max(0, subtotal + shipping - discount + tax);

  return {
    subtotal: subtotal.toFixed(2),
    shipping: shipping.toFixed(2),
    discount: discount.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
    currency: "USD",
    shippingMethodName: shippingRate.name,
  };
}

export async function createOrderFromCart(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    include: { payments: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  if (existing) {
    const payment = existing.payments[0];
    return {
      success: true,
      orderId: existing.id,
      orderNumber: existing.orderNumber,
      total: existing.total.toString(),
      paymentId: payment?.id ?? "",
    };
  }

  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: {
          product: { include: { inventory: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const totals = await calculateCheckoutTotals(
    cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    input.shippingMethod,
    input.couponCode,
  );

  if ("error" in totals) {
    return { success: false, error: totals.error };
  }

  const shippingRate = await getActiveShippingRate(input.shippingMethod);
  const coupon = await resolveCoupon(input.couponCode);
  const billingAddress =
    input.billingAddress ?? input.shippingAddress;

  const provider =
    input.paymentMethod === PaymentMethod.CREDIT_CARD
      ? PaymentProvider.MIDTRANS
      : PaymentProvider.PAYPAL;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const inv = item.product.inventory;
        if (!inv) continue;

        const available = inv.quantity - inv.reservedQuantity;
        if (available < item.quantity) {
          throw new Error(`Not enough stock for ${item.product.name}.`);
        }

        await tx.inventory.update({
          where: { id: inv.id },
          data: { reservedQuantity: { increment: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: input.userId,
          guestEmail: input.userId ? null : input.email.toLowerCase(),
          status: "PENDING",
          subtotal: totals.subtotal,
          shippingAmount: totals.shipping,
          shippingMethod: input.shippingMethod,
          shippingMethodName: shippingRate?.name ?? totals.shippingMethodName,
          discountAmount: totals.discount,
          taxAmount: totals.tax,
          total: totals.total,
          currency: totals.currency,
          shippingAddress: input.shippingAddress,
          billingAddress,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          idempotencyKey: input.idempotencyKey,
          notes: input.notes || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSku: item.product.sku,
              unitPrice: item.product.price,
              quantity: item.quantity,
              totalPrice: (
                Number(item.product.price) * item.quantity
              ).toFixed(2),
            })),
          },
        },
      });

      const payment = await tx.payment.create({
        data: {
          orderId: created.id,
          provider,
          method: input.paymentMethod,
          status: PaymentStatus.PENDING,
          amount: totals.total,
          currency: totals.currency,
          idempotencyKey: `${input.idempotencyKey}:payment`,
        },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.abandonedCheckout.create({
        data: {
          email: input.email.toLowerCase(),
          orderId: created.id,
          cartSnapshot: cart.items,
          step: "payment",
          recoveredAt: new Date(),
        },
      });

      return { order: created, payment };
    });

    return {
      success: true,
      orderId: order.order.id,
      orderNumber: order.order.orderNumber,
      total: order.order.total.toString(),
      paymentId: order.payment.id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create order.";
    return { success: false, error: message };
  }
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

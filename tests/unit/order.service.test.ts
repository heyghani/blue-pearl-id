import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockProductFindMany = vi.fn();
const mockShippingFindFirst = vi.fn();
const mockCouponFindUnique = vi.fn();
const mockOrderFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => mockProductFindMany(...args),
    },
    shippingRate: {
      findFirst: (...args: unknown[]) => mockShippingFindFirst(...args),
    },
    coupon: {
      findUnique: (...args: unknown[]) => mockCouponFindUnique(...args),
    },
    order: {
      findUnique: (...args: unknown[]) => mockOrderFindUnique(...args),
    },
    cart: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import {
  calculateCheckoutTotals,
  createOrderFromCart,
} from "@/lib/services/order.service";
import { PaymentMethod, ShippingMethodType } from "@prisma/client";

describe("calculateCheckoutTotals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCouponFindUnique.mockResolvedValue(null);
    mockShippingFindFirst.mockResolvedValue({
      name: "Standard Shipping",
      price: new Decimal(15),
    });
  });

  it("returns error for empty cart", async () => {
    const result = await calculateCheckoutTotals([], ShippingMethodType.STANDARD);

    expect(result).toEqual({ error: "Your cart is empty." });
  });

  it("calculates subtotal, shipping, and total", async () => {
    mockProductFindMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Pearl Necklace",
        price: new Decimal(100),
        hasVariants: false,
        inventory: { quantity: 10, reservedQuantity: 0 },
      },
    ]);

    const result = await calculateCheckoutTotals(
      [{ productId: "prod-1", quantity: 2 }],
      ShippingMethodType.STANDARD,
    );

    expect(result).toEqual({
      subtotal: "200.00",
      shipping: "15.00",
      discount: "0.00",
      tax: "0.00",
      total: "215.00",
      currency: "USD",
      shippingMethodName: "Standard Shipping",
    });
  });

  it("rejects when stock is insufficient", async () => {
    mockProductFindMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Pearl Necklace",
        price: new Decimal(100),
        hasVariants: false,
        inventory: { quantity: 1, reservedQuantity: 0 },
      },
    ]);

    const result = await calculateCheckoutTotals(
      [{ productId: "prod-1", quantity: 3 }],
      ShippingMethodType.STANDARD,
    );

    expect(result).toEqual({ error: "Not enough stock for Pearl Necklace." });
  });
});

describe("createOrderFromCart idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing order when idempotency key matches", async () => {
    mockOrderFindUnique.mockResolvedValue({
      id: "order-1",
      orderNumber: "BP-20260618-TEST",
      total: new Decimal(215),
      payments: [{ id: "payment-1" }],
    });

    const result = await createOrderFromCart({
      email: "jane@example.com",
      shippingAddress: {
        firstName: "Jane",
        lastName: "Doe",
        line1: "123 Pearl St",
        city: "Singapore",
        postalCode: "018956",
        country: "SG",
      },
      shippingMethod: ShippingMethodType.STANDARD,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      idempotencyKey: "idem-123",
      cartId: "cart-1",
    });

    expect(result).toEqual({
      success: true,
      orderId: "order-1",
      orderNumber: "BP-20260618-TEST",
      total: "215",
      paymentId: "payment-1",
    });
  });
});

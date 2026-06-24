import { Prisma } from "@prisma/client";

import {
  clearCartSessionId,
  getCartSessionId,
  setCartSessionId,
} from "@/lib/cart/cookie";
import { prisma } from "@/lib/db";

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: true,
        },
      },
      variant: {
        include: {
          optionValues: {
            include: {
              optionValue: {
                include: { option: true },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export type CartLineItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    slug: string;
    name: string;
    price: string;
    imageUrl: string | null;
    variantLabel: string | null;
    inStock: boolean;
    maxQuantity: number;
  };
};

export type CartView = {
  id: string | null;
  items: CartLineItem[];
  itemCount: number;
  subtotal: string;
};

function emptyCart(): CartView {
  return { id: null, items: [], itemCount: 0, subtotal: "0.00" };
}

function getAvailableQuantity(inventory?: { quantity: number } | null) {
  if (!inventory) return 99;
  return Math.max(0, inventory.quantity);
}

function getVariantLabel(
  variant?: {
    optionValues: {
      optionValue: { value: string; option: { name: string } };
    }[];
  } | null,
) {
  if (!variant) return null;

  return variant.optionValues
    .map((entry) => entry.optionValue.value)
    .join(" / ");
}

function getItemAvailability(item: {
  product: {
    isActive: boolean;
    deletedAt: Date | null;
    inventory: { quantity: number } | null;
  };
  variant?: { quantity: number; isActive: boolean } | null;
}) {
  if (!item.product.isActive || item.product.deletedAt) {
    return { inStock: false, maxQuantity: 0 };
  }

  if (item.variant) {
    const maxQuantity = item.variant.isActive
      ? Math.max(0, item.variant.quantity)
      : 0;
    return { inStock: maxQuantity > 0, maxQuantity };
  }

  const maxQuantity = getAvailableQuantity(item.product.inventory);
  return { inStock: maxQuantity > 0, maxQuantity };
}

function getItemUnitPrice(item: {
  product: { price: Prisma.Decimal };
  variant?: { price: Prisma.Decimal | null } | null;
}) {
  if (item.variant?.price) {
    return item.variant.price.toString();
  }

  return item.product.price.toString();
}

function toLineItem(item: {
  id: string;
  productId: string;
  quantity: number;
  product: {
    slug: string;
    name: string;
    price: Prisma.Decimal;
    isActive: boolean;
    deletedAt: Date | null;
    images: { url: string }[];
    inventory: { quantity: number } | null;
  };
  variant?: {
    price: Prisma.Decimal | null;
    quantity: number;
    isActive: boolean;
    imageUrl: string | null;
    optionValues: {
      optionValue: { value: string; option: { name: string } };
    }[];
  } | null;
}): CartLineItem {
  const availability = getItemAvailability(item);

  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      slug: item.product.slug,
      name: item.product.name,
      price: getItemUnitPrice(item),
      imageUrl: item.variant?.imageUrl ?? item.product.images[0]?.url ?? null,
      variantLabel: getVariantLabel(item.variant),
      inStock: availability.inStock,
      maxQuantity: availability.inStock ? availability.maxQuantity : 0,
    },
  };
}

function toCartView(cart: {
  id: string;
  items: Parameters<typeof toLineItem>[0][];
}): CartView {
  const items = cart.items.map(toLineItem);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: subtotal.toFixed(2),
  };
}

function cartExpiry() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

async function consolidateGuestCarts(sessionId: string) {
  const carts = await prisma.cart.findMany({
    where: { sessionId, userId: null },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: { items: true },
  });

  if (carts.length <= 1) return;

  const [primary, ...duplicates] = carts;

  for (const duplicate of duplicates) {
    for (const item of duplicate.items) {
      const existing = await prisma.cartItem.findUnique({
        where: {
          cartId_productId_variantKey: {
            cartId: primary.id,
            productId: item.productId,
            variantKey: item.variantKey,
          },
        },
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
        await prisma.cartItem.delete({ where: { id: item.id } });
      } else {
        await prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: primary.id },
        });
      }
    }

    await prisma.cart.delete({ where: { id: duplicate.id } });
  }
}

async function getOrCreateUserCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, expiresAt: cartExpiry() },
      include: cartInclude,
    });
  }

  return cart;
}

async function getOrCreateGuestCart(sessionId: string) {
  await consolidateGuestCarts(sessionId);

  try {
    return await prisma.cart.upsert({
      where: { sessionId },
      create: { sessionId, expiresAt: cartExpiry() },
      update: { expiresAt: cartExpiry() },
      include: cartInclude,
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    await consolidateGuestCarts(sessionId);

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });

    if (!cart) {
      throw error;
    }

    return cart;
  }
}

async function getAuthUserId() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  return session?.user?.id;
}

async function resolveCartRecord(createGuest = false) {
  const userId = await getAuthUserId();
  const sessionId = await getCartSessionId();

  if (userId) {
    return getOrCreateUserCart(userId);
  }

  if (sessionId) {
    await consolidateGuestCarts(sessionId);

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: cartInclude,
    });
    if (cart) return cart;
  }

  if (createGuest) {
    const newSessionId = sessionId ?? crypto.randomUUID();
    if (!sessionId) {
      await setCartSessionId(newSessionId);
    }
    return getOrCreateGuestCart(newSessionId);
  }

  return null;
}

async function validateAndFixStock(cartId: string) {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: {
      product: { include: { inventory: true } },
      variant: true,
    },
  });

  for (const item of items) {
    const availability = getItemAvailability(item);

    if (!availability.inStock) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      continue;
    }

    if (item.quantity > availability.maxQuantity) {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: availability.maxQuantity },
      });
    }
  }
}

export async function getCart(): Promise<CartView> {
  const cart = await resolveCartRecord(false);
  if (!cart) return emptyCart();

  await validateAndFixStock(cart.id);

  const refreshed = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });

  return refreshed ? toCartView(refreshed) : emptyCart();
}

export async function addToCart(
  productId: string,
  quantity: number,
  variantId?: string,
): Promise<{ cart?: CartView; error?: string }> {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
    include: { inventory: true },
  });

  if (!product) {
    return { error: "Product not found or unavailable." };
  }

  let variant:
    | {
        id: string;
        quantity: number;
        isActive: boolean;
      }
    | null = null;

  if (product.hasVariants) {
    if (!variantId) {
      return { error: "Please select product options." };
    }

    variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId,
        isActive: true,
      },
      select: { id: true, quantity: true, isActive: true },
    });

    if (!variant) {
      return { error: "Selected variant is unavailable." };
    }

    if (variant.quantity < quantity) {
      return { error: "Not enough stock available." };
    }
  } else if (variantId) {
    return { error: "This product does not have variants." };
  } else {
    const available = getAvailableQuantity(product.inventory);
    if (available < quantity) {
      return { error: "Not enough stock available." };
    }
  }

  const cart = await resolveCartRecord(true);
  if (!cart) return { error: "Could not create cart." };

  const variantKey = variantId ?? "";
  const existing = cart.items.find(
    (item) => item.productId === productId && item.variantKey === variantKey,
  );
  const available = variant
    ? variant.quantity
    : getAvailableQuantity(product.inventory);
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (newQuantity > available) {
    return { error: `Only ${available} available in stock.` };
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId ?? null,
        variantKey,
        quantity,
      },
    });
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { expiresAt: cartExpiry() },
  });

  return { cart: await getCart() };
}

export async function updateCartItem(
  itemId: string,
  quantity: number,
): Promise<{ cart?: CartView; error?: string }> {
  const cart = await resolveCartRecord(false);
  if (!cart) return { error: "Cart not found." };

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return { error: "Item not found in cart." };

  const availability = getItemAvailability(item);
  if (!availability.inStock) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { error: "Product is no longer available.", cart: await getCart() };
  }

  if (quantity > availability.maxQuantity) {
    return { error: `Only ${availability.maxQuantity} available in stock.` };
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return { cart: await getCart() };
}

export async function removeCartItem(
  itemId: string,
): Promise<{ cart?: CartView; error?: string }> {
  const cart = await resolveCartRecord(false);
  if (!cart) return { error: "Cart not found." };

  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return { error: "Item not found in cart." };

  await prisma.cartItem.delete({ where: { id: itemId } });
  return { cart: await getCart() };
}

export async function mergeGuestCartOnLogin(userId: string) {
  const sessionId = await getCartSessionId();
  if (!sessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    await clearCartSessionId();
    return;
  }

  const userCart = await getOrCreateUserCart(userId);

  for (const item of guestCart.items) {
    const fullItem = await prisma.cartItem.findUnique({
      where: { id: item.id },
      include: {
        product: { include: { inventory: true } },
        variant: true,
      },
    });
    if (!fullItem) continue;

    const availability = getItemAvailability(fullItem);
    if (!availability.inStock) continue;

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantKey: {
          cartId: userCart.id,
          productId: item.productId,
          variantKey: item.variantKey,
        },
      },
    });

    const mergedQty = Math.min(
      availability.maxQuantity,
      (existing?.quantity ?? 0) + item.quantity,
    );

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: mergedQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          variantId: item.variantId,
          variantKey: item.variantKey,
          quantity: Math.min(availability.maxQuantity, item.quantity),
        },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  await clearCartSessionId();
}

export async function getCheckoutCart() {
  const cart = await resolveCartRecord(false);
  if (!cart || cart.items.length === 0) return null;

  await validateAndFixStock(cart.id);

  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: cartInclude,
  });
}

export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  return cart.itemCount;
}

import { Prisma } from "@prisma/client";

import {
  clearCartSessionId,
  getCartSessionId,
  setCartSessionId,
} from "@/lib/cart/cookie";
import { prisma } from "@/lib/db";

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
}): CartLineItem {
  const maxQuantity = getAvailableQuantity(item.product.inventory);
  const inStock =
    item.product.isActive &&
    !item.product.deletedAt &&
    maxQuantity > 0;

  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price.toString(),
      imageUrl: item.product.images[0]?.url ?? null,
      inStock,
      maxQuantity: inStock ? maxQuantity : 0,
    },
  };
}

function toCartView(cart: {
  id: string;
  items: Parameters<typeof toLineItem>[0][];
}): CartView {
  const items = cart.items.map(toLineItem);
  const subtotal = cart.items.reduce(
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
  let cart = await prisma.cart.findFirst({
    where: { sessionId, userId: null },
    include: cartInclude,
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId, expiresAt: cartExpiry() },
      include: cartInclude,
    });
  }

  return cart;
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
    const cart = await prisma.cart.findFirst({
      where: { sessionId, userId: null },
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
    include: { product: { include: { inventory: true } } },
  });

  for (const item of items) {
    const max = getAvailableQuantity(item.product.inventory);
    const inactive = !item.product.isActive || item.product.deletedAt;

    if (inactive || max === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      continue;
    }

    if (item.quantity > max) {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: max },
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
): Promise<{ cart?: CartView; error?: string }> {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
    include: { inventory: true },
  });

  if (!product) {
    return { error: "Product not found or unavailable." };
  }

  const available = getAvailableQuantity(product.inventory);
  if (available < quantity) {
    return { error: "Not enough stock available." };
  }

  const cart = await resolveCartRecord(true);
  if (!cart) return { error: "Could not create cart." };

  const existing = cart.items.find((item) => item.productId === productId);
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
      data: { cartId: cart.id, productId, quantity },
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

  const product = await prisma.product.findUnique({
    where: { id: item.productId },
    include: { inventory: true },
  });

  if (!product?.isActive || product.deletedAt) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { error: "Product is no longer available.", cart: await getCart() };
  }

  const available = getAvailableQuantity(product.inventory);
  if (quantity > available) {
    return { error: `Only ${available} available in stock.` };
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

  const guestCart = await prisma.cart.findFirst({
    where: { sessionId, userId: null },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    await clearCartSessionId();
    return;
  }

  const userCart = await getOrCreateUserCart(userId);

  for (const item of guestCart.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { inventory: true },
    });
    if (!product?.isActive || product.deletedAt) continue;

    const available = getAvailableQuantity(product.inventory);
    if (available === 0) continue;

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: userCart.id,
          productId: item.productId,
        },
      },
    });

    const mergedQty = Math.min(
      available,
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
          quantity: Math.min(available, item.quantity),
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

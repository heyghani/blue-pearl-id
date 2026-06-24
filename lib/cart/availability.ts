export function getAvailableQuantity(inventory?: { quantity: number } | null) {
  if (!inventory) return 99;
  return Math.max(0, inventory.quantity);
}

export function getItemAvailability(item: {
  product: {
    isActive: boolean;
    deletedAt: Date | null;
    hasVariants: boolean;
    inventory: { quantity: number } | null;
  };
  variant?: { quantity: number; isActive: boolean } | null;
}) {
  if (!item.product.isActive || item.product.deletedAt) {
    return { inStock: false, maxQuantity: 0 };
  }

  if (item.product.hasVariants) {
    if (!item.variant || !item.variant.isActive) {
      return { inStock: false, maxQuantity: 0 };
    }

    const maxQuantity = Math.max(0, item.variant.quantity);
    return { inStock: maxQuantity > 0, maxQuantity };
  }

  const maxQuantity = getAvailableQuantity(item.product.inventory);
  return { inStock: maxQuantity > 0, maxQuantity };
}

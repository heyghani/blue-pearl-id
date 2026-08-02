import type { Prisma } from "@prisma/client";

export type OrderLineOption = {
  name: string;
  value: string;
};

export function parseOrderItemOptions(
  optionsJson: unknown,
  variantLabel?: string | null,
): OrderLineOption[] {
  if (Array.isArray(optionsJson)) {
    return optionsJson
      .map((entry) => {
        if (
          entry &&
          typeof entry === "object" &&
          "name" in entry &&
          "value" in entry &&
          typeof (entry as OrderLineOption).name === "string" &&
          typeof (entry as OrderLineOption).value === "string"
        ) {
          return {
            name: (entry as OrderLineOption).name,
            value: (entry as OrderLineOption).value,
          };
        }
        return null;
      })
      .filter((entry): entry is OrderLineOption => entry !== null);
  }

  if (variantLabel?.trim()) {
    return variantLabel.split(" / ").map((part) => {
      const colon = part.indexOf(": ");
      if (colon > 0) {
        return {
          name: part.slice(0, colon).trim(),
          value: part.slice(colon + 2).trim(),
        };
      }
      return { name: "Option", value: part.trim() };
    });
  }

  return [];
}

/** Legacy orders mashed options into productName as "Name — Label". */
export function splitLegacyProductName(productName: string): {
  title: string;
  legacyLabel: string | null;
} {
  const separators = [" — ", " -- ", " - "];
  for (const separator of separators) {
    const index = productName.lastIndexOf(separator);
    if (index > 0) {
      const maybeLabel = productName.slice(index + separator.length).trim();
      // Heuristic: treat as legacy mash when the suffix looks like options (contains / or US).
      if (
        maybeLabel.includes("/") ||
        /\bUS\d/i.test(maybeLabel) ||
        /^(Color|US|Size|Shoe size):/i.test(maybeLabel)
      ) {
        return {
          title: productName.slice(0, index).trim(),
          legacyLabel: maybeLabel,
        };
      }
    }
  }
  return { title: productName, legacyLabel: null };
}

export function formatOrderItemOptionsLabel(options: OrderLineOption[]) {
  if (options.length === 0) return null;
  return options.map((option) => `${option.name}: ${option.value}`).join(" / ");
}

/** Include product images/variants so legacy order rows can resolve a thumbnail. */
export const orderItemImageInclude = {
  product: {
    select: {
      images: {
        orderBy: [{ isPrimary: "desc" as const }, { sortOrder: "asc" as const }],
        take: 1,
        select: { url: true },
      },
      variants: {
        select: { id: true, sku: true, imageUrl: true },
      },
    },
  },
} satisfies Prisma.OrderItemInclude;

type OrderLineImageSource = {
  imageUrl?: string | null;
  productSku?: string | null;
  variantId?: string | null;
  product?: {
    images?: Array<{ url: string }>;
    variants?: Array<{
      id: string;
      sku: string;
      imageUrl: string | null;
    }>;
  } | null;
};

/**
 * Prefer the order-item snapshot; for legacy rows without imageUrl,
 * fall back to the matched variant image or the product primary image.
 */
export function resolveOrderLineImageUrl(item: OrderLineImageSource): string | null {
  if (item.imageUrl?.trim()) return item.imageUrl.trim();

  const variants = item.product?.variants ?? [];
  const matchedVariant =
    (item.variantId
      ? variants.find((variant) => variant.id === item.variantId)
      : undefined) ??
    (item.productSku
      ? variants.find((variant) => variant.sku === item.productSku)
      : undefined);

  if (matchedVariant?.imageUrl?.trim()) {
    return matchedVariant.imageUrl.trim();
  }

  const productImage = item.product?.images?.[0]?.url?.trim();
  return productImage || null;
}


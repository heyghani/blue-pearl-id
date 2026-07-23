export type ProductOptionInput = {
  name: string;
  values: string[];
};

export type ProductVariantInput = {
  sku: string;
  price: number | null;
  compareAtPrice: number | null;
  quantity: number;
  imageUrl: string | null;
  isActive: boolean;
  optionValues: Record<string, string>;
};

export type SerializedProductOption = {
  id: string;
  name: string;
  values: { id: string; value: string }[];
};

export type SerializedProductVariant = {
  id: string;
  sku: string;
  price: string | null;
  compareAtPrice: string | null;
  imageUrl: string | null;
  quantity: number;
  isActive: boolean;
  optionValueIds: string[];
};

export function cartesianProduct<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((combo) => curr.map((item) => [...combo, item])),
    [[]],
  );
}

export function slugifyOptionToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildVariantSku(baseSku: string, optionValues: Record<string, string>) {
  const suffix = Object.values(optionValues)
    .map(slugifyOptionToken)
    .filter(Boolean)
    .join("-");

  return suffix ? `${baseSku}-${suffix}` : baseSku;
}

/** Default US shoe sizes pre-filled on new products (admin can edit/add). */
export const DEFAULT_US_SIZE_VALUES = [
  "US4",
  "US4.5",
  "US5",
  "US5.5",
  "US6",
  "US6.5",
  "US7",
  "US7.5",
  "US8",
  "US8.5",
  "US9",
  "US9.5",
  "US10",
  "US10.5",
  "US11",
  "US11.5",
  "US12",
] as const;

export const DEFAULT_US_SIZE_OPTION_NAME = "US";

export function getDefaultUsSizeOption(): ProductOptionInput {
  return {
    name: DEFAULT_US_SIZE_OPTION_NAME,
    values: [...DEFAULT_US_SIZE_VALUES],
  };
}

export function getDefaultProductVariantState(
  baseSku: string,
  basePrice: number,
  defaultQuantity = 0,
): {
  hasVariants: true;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
} {
  const options = [getDefaultUsSizeOption()];
  return {
    hasVariants: true,
    options,
    variants: generateVariantCombinations(
      options,
      baseSku,
      basePrice,
      defaultQuantity,
    ),
  };
}

export function generateVariantCombinations(
  options: ProductOptionInput[],
  baseSku: string,
  basePrice: number,
  defaultQuantity = 0,
): ProductVariantInput[] {
  const normalized = options
    .map((option) => ({
      name: option.name.trim(),
      values: option.values.map((value) => value.trim()).filter(Boolean),
    }))
    .filter((option) => option.name && option.values.length > 0);

  if (normalized.length === 0) return [];

  const combinations = cartesianProduct(
    normalized.map((option) =>
      option.values.map((value) => ({ optionName: option.name, value })),
    ),
  );

  const quantity = Number.isFinite(defaultQuantity)
    ? Math.max(0, Math.floor(defaultQuantity))
    : 0;

  return combinations.map((combo) => {
    const optionValues = Object.fromEntries(
      combo.map(({ optionName, value }) => [optionName, value]),
    );

    return {
      sku: buildVariantSku(baseSku, optionValues),
      price: basePrice,
      compareAtPrice: null,
      quantity,
      imageUrl: null,
      isActive: true,
      optionValues,
    };
  });
}

/** Inventory field default when editing a variant product (not the summed total). */
export function deriveVariantDefaultQuantity(
  variants: { quantity: number }[],
  fallback = 0,
) {
  if (variants.length === 0) return fallback;

  const counts = new Map<number, number>();
  for (const variant of variants) {
    counts.set(variant.quantity, (counts.get(variant.quantity) ?? 0) + 1);
  }

  let bestQuantity = variants[0].quantity;
  let bestCount = 0;
  for (const [quantity, count] of counts) {
    if (count > bestCount) {
      bestQuantity = quantity;
      bestCount = count;
    }
  }

  return bestQuantity;
}

export function variantCombinationKey(optionValues: Record<string, string>) {
  return Object.entries(optionValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

export function parseVariantsPayload(raw: unknown): {
  hasVariants: boolean;
  options: ProductOptionInput[];
  variants: ProductVariantInput[];
} {
  if (!raw || typeof raw !== "object") {
    return { hasVariants: false, options: [], variants: [] };
  }

  const payload = raw as {
    hasVariants?: unknown;
    options?: unknown;
    variants?: unknown;
  };

  const hasVariants = payload.hasVariants === true;
  if (!hasVariants) {
    return { hasVariants: false, options: [], variants: [] };
  }

  const options = Array.isArray(payload.options)
    ? payload.options
        .map((option) => {
          if (!option || typeof option !== "object") return null;
          const record = option as { name?: unknown; values?: unknown };
          const name = typeof record.name === "string" ? record.name.trim() : "";
          const values = Array.isArray(record.values)
            ? record.values
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean)
            : [];

          if (!name || values.length === 0) return null;
          return { name, values };
        })
        .filter((option): option is ProductOptionInput => option !== null)
    : [];

  const variants = Array.isArray(payload.variants)
    ? payload.variants
        .map((variant) => {
          if (!variant || typeof variant !== "object") return null;
          const record = variant as {
            sku?: unknown;
            price?: unknown;
            compareAtPrice?: unknown;
            quantity?: unknown;
            imageUrl?: unknown;
            isActive?: unknown;
            optionValues?: unknown;
          };

          const sku = typeof record.sku === "string" ? record.sku.trim() : "";
          if (!sku) return null;

          const optionValues: Record<string, string> = {};
          if (record.optionValues && typeof record.optionValues === "object") {
            for (const [key, value] of Object.entries(record.optionValues)) {
              if (typeof value === "string" && value.trim()) {
                optionValues[key.trim()] = value.trim();
              }
            }
          }

          if (Object.keys(optionValues).length === 0) return null;

          const quantity =
            typeof record.quantity === "number"
              ? Math.max(0, Math.floor(record.quantity))
              : Number(record.quantity) >= 0
                ? Math.floor(Number(record.quantity))
                : 0;

          return {
            sku,
            price:
              record.price === null || record.price === undefined || record.price === ""
                ? null
                : Number(record.price),
            compareAtPrice:
              record.compareAtPrice === null ||
              record.compareAtPrice === undefined ||
              record.compareAtPrice === ""
                ? null
                : Number(record.compareAtPrice),
            quantity,
            imageUrl:
              typeof record.imageUrl === "string" && record.imageUrl.trim()
                ? record.imageUrl.trim()
                : null,
            isActive: record.isActive !== false,
            optionValues,
          };
        })
        .filter((variant) => variant !== null) as ProductVariantInput[]
    : [];

  return { hasVariants, options, variants };
}

type DbOption = {
  id: string;
  name: string;
  values: { id: string; value: string }[];
};

type DbVariant = {
  id: string;
  sku: string;
  price: { toString(): string } | null;
  compareAtPrice: { toString(): string } | null;
  imageUrl: string | null;
  quantity: number;
  isActive: boolean;
  optionValues: { optionValueId: string }[];
};

export function serializeProductVariants(
  options: DbOption[],
  variants: DbVariant[],
): {
  options: SerializedProductOption[];
  variants: SerializedProductVariant[];
} {
  return {
    options: options.map((option) => ({
      id: option.id,
      name: option.name,
      values: option.values.map((value) => ({
        id: value.id,
        value: value.value,
      })),
    })),
    variants: variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price?.toString() ?? null,
      compareAtPrice: variant.compareAtPrice?.toString() ?? null,
      imageUrl: variant.imageUrl,
      quantity: variant.quantity,
      isActive: variant.isActive,
      optionValueIds: variant.optionValues.map((entry) => entry.optionValueId),
    })),
  };
}

export function getVariantLabel(
  variant?: {
    optionValues: {
      optionValue: { value: string; option?: { name: string; position?: number } };
    }[];
  } | null,
) {
  if (!variant?.optionValues.length) return null;

  const ordered = [...variant.optionValues].sort((a, b) => {
    const positionDiff =
      (a.optionValue.option?.position ?? 0) - (b.optionValue.option?.position ?? 0);
    if (positionDiff !== 0) return positionDiff;
    return (a.optionValue.option?.name ?? "").localeCompare(
      b.optionValue.option?.name ?? "",
    );
  });

  return ordered.map((entry) => entry.optionValue.value).join(" / ");
}

/** Prefer the exact SKU image; otherwise inherit from a sibling sharing options (e.g. same Color). */
export function resolveVariantImageUrl(
  variant:
    | {
        imageUrl: string | null;
        optionValueIds: string[];
      }
    | null
    | undefined,
  siblings: {
    imageUrl: string | null;
    optionValueIds: string[];
    isActive?: boolean;
  }[],
  fallbackUrl: string | null = null,
): string | null {
  if (variant?.imageUrl) return variant.imageUrl;
  if (!variant) return fallbackUrl;

  let best: { url: string; score: number } | null = null;

  for (const sibling of siblings) {
    if (!sibling.imageUrl || sibling.isActive === false) continue;

    const shared = sibling.optionValueIds.filter((id) =>
      variant.optionValueIds.includes(id),
    ).length;

    if (shared === 0) continue;
    if (!best || shared > best.score) {
      best = { url: sibling.imageUrl, score: shared };
    }
  }

  return best?.url ?? fallbackUrl;
}

export function findPartialVariantPreview(
  variants: SerializedProductVariant[],
  options: SerializedProductOption[],
  selections: Record<string, string>,
) {
  const selectedIds = options
    .map((option) => {
      const value = selections[option.id];
      if (!value) return null;
      return option.values.find((entry) => entry.value === value)?.id ?? null;
    })
    .filter((id): id is string => Boolean(id));

  if (selectedIds.length === 0) return null;

  return (
    variants.find(
      (variant) =>
        variant.isActive &&
        selectedIds.every((id) => variant.optionValueIds.includes(id)),
    ) ?? null
  );
}

export function findVariantBySelections(
  variants: SerializedProductVariant[],
  options: SerializedProductOption[],
  selections: Record<string, string>,
) {
  const selectedIds = options
    .map((option) => {
      const value = selections[option.id];
      return option.values.find((entry) => entry.value === value)?.id;
    })
    .filter((id): id is string => Boolean(id));

  if (selectedIds.length !== options.length) return null;

  return (
    variants.find(
      (variant) =>
        variant.isActive &&
        selectedIds.every((id) => variant.optionValueIds.includes(id)),
    ) ?? null
  );
}

export function getVariantDisplayPrice(
  variant: SerializedProductVariant | null,
  basePrice: string,
) {
  return variant?.price ?? basePrice;
}

export function getVariantCompareAtPrice(
  variant: SerializedProductVariant | null,
  baseCompareAt: string | null,
) {
  return variant?.compareAtPrice ?? baseCompareAt;
}

export function variantInStock(variant: SerializedProductVariant | null) {
  return Boolean(variant?.isActive && variant.quantity > 0);
}

export function getProductStockSummary(product: {
  hasVariants?: boolean;
  inventory?: { quantity: number } | null;
  variants?: { quantity: number; isActive: boolean }[];
}) {
  if (product.hasVariants && product.variants) {
    const activeVariants = product.variants.filter((variant) => variant.isActive);
    const total = activeVariants.reduce((sum, variant) => sum + variant.quantity, 0);
    return {
      inStock: total > 0,
      quantity: total,
      variantCount: activeVariants.length,
    };
  }

  const quantity = product.inventory?.quantity ?? 0;
  return {
    inStock: quantity > 0,
    quantity,
    variantCount: 0,
  };
}

export function adminVariantsToFormState(
  options: DbOption[],
  variants: DbVariant[],
) {
  return {
    hasVariants: options.length > 0 && variants.length > 0,
    options: options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => value.value),
    })),
    variants: variants.map((variant) => {
      const optionValues: Record<string, string> = {};
      for (const entry of variant.optionValues) {
        const optionValue = options
          .flatMap((option) => option.values)
          .find((value) => value.id === entry.optionValueId);
        const option = options.find((item) =>
          item.values.some((value) => value.id === entry.optionValueId),
        );
        if (option && optionValue) {
          optionValues[option.name] = optionValue.value;
        }
      }

      return {
        sku: variant.sku,
        price: variant.price ? Number(variant.price.toString()) : null,
        compareAtPrice: variant.compareAtPrice
          ? Number(variant.compareAtPrice.toString())
          : null,
        quantity: variant.quantity,
        imageUrl: variant.imageUrl,
        isActive: variant.isActive,
        optionValues,
      };
    }),
  };
}

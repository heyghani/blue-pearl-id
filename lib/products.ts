import type { Prisma } from "@prisma/client";

import { expandCategorySlugs } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { getProductStockSummary } from "@/lib/products/variants";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export interface CatalogParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  brand?: string | string[];
  sort?: ProductSort;
  featured?: boolean;
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  inventory: true,
  category: { select: { name: true, slug: true, parent: { select: { name: true, slug: true } } } },
  brand: { select: { name: true, slug: true, logoUrl: true } },
  variants: {
    where: { isActive: true },
    select: { quantity: true, isActive: true },
  },
} satisfies Prisma.ProductInclude;

const productDetailInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: { include: { parent: { select: { name: true, slug: true } } } },
  brand: true,
  inventory: true,
  options: {
    orderBy: { position: "asc" as const },
    include: {
      values: { orderBy: { position: "asc" as const } },
    },
  },
  variants: {
    where: { isActive: true },
    orderBy: { sortOrder: "asc" as const },
    include: {
      optionValues: true,
    },
  },
} satisfies Prisma.ProductInclude;

function getOrderBy(sort?: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "popular":
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

function buildWhere(params: CatalogParams, categorySlugs?: string[]): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (params.featured) {
    where.isFeatured = true;
  }

  const categories = categorySlugs ?? (
    params.category
      ? (Array.isArray(params.category) ? params.category : [params.category]).filter(Boolean)
      : []
  );

  if (categories.length > 0) {
    where.category = { slug: { in: categories } };
  }

  if (params.brand) {
    const brandSlugs = (
      Array.isArray(params.brand) ? params.brand : [params.brand]
    ).filter(Boolean);

    if (brandSlugs.length > 0) {
      where.brand = { slug: { in: brandSlugs } };
    }
  }

  const search = params.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search] } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function getCatalogProducts(params: CatalogParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 24));

  const rawCategories = params.category
    ? (Array.isArray(params.category) ? params.category : [params.category]).filter(Boolean)
    : [];

  let categorySlugs: string[] | undefined;
  if (rawCategories.length > 0) {
    const expanded = await expandCategorySlugs(rawCategories);
    categorySlugs = expanded === null ? ["__invalid_category__"] : expanded;
  }

  const where = buildWhere(params, categorySlugs);

  const total = await prisma.product.count({ where });
  const totalPages = Math.ceil(total / limit) || 1;
  const effectivePage = Math.min(page, totalPages);
  const skip = (effectivePage - 1) * limit;

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: getOrderBy(params.sort),
    skip,
    take: limit,
  });

  return {
    products,
    total,
    page: effectivePage,
    limit,
    totalPages,
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: productDetailInclude,
  });
}

export async function getRelatedProducts(
  categoryId: string | null | undefined,
  excludeSlug: string,
  limit = 4,
) {
  if (!categoryId) return [];

  return prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      deletedAt: null,
      slug: { not: excludeSlug },
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: true,
      variants: {
        where: { isActive: true },
        select: { quantity: true, isActive: true },
      },
    },
    take: limit,
    orderBy: { isFeatured: "desc" },
  });
}

export async function getAllProductSlugs() {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    select: { slug: true, updatedAt: true },
  });
}

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true, deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: true,
      variants: {
        where: { isActive: true },
        select: { quantity: true, isActive: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getFeaturedProductCount() {
  return prisma.product.count({
    where: { isActive: true, isFeatured: true, deletedAt: null },
  });
}

export async function getBestSellerProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: true,
      variants: {
        where: { isActive: true },
        select: { quantity: true, isActive: true },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export function toProductCard(product: {
  slug: string;
  name: string;
  price: { toString(): string };
  compareAtPrice?: { toString(): string } | null;
  imageUrl?: string | null;
  images: { url: string }[];
  inventory?: { quantity: number } | null;
  hasVariants?: boolean;
  variants?: { quantity: number; isActive: boolean }[];
  brand?: { name: string; slug: string } | null;
  tags?: string[];
}) {
  const stock = getProductStockSummary(product);

  return {
    slug: product.slug,
    name: product.name,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    imageUrl: product.images[0]?.url ?? null,
    inStock: stock.inStock,
    brandName: product.brand?.name ?? null,
    tags: product.tags ?? [],
  };
}

export function isInStock(
  product: {
    hasVariants?: boolean;
    inventory?: { quantity: number } | null;
    variants?: { quantity: number; isActive: boolean }[];
  },
  inventory?: { quantity: number } | null,
) {
  if (typeof product === "object" && product !== null && "hasVariants" in product) {
    return getProductStockSummary(product).inStock;
  }

  if (!inventory) return true;
  return inventory.quantity > 0;
}

export function parseProductSpecs(
  metadata: unknown,
): Record<string, string> | null {
  if (!metadata || typeof metadata !== "object") return null;
  const specs = (metadata as { specs?: unknown }).specs;
  if (!specs || typeof specs !== "object") return null;

  const entries = Object.entries(specs as Record<string, unknown>).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && entry[1].length > 0,
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

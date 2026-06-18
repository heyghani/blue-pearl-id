import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular";

export interface CatalogParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string | string[];
  sort?: ProductSort;
  featured?: boolean;
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  inventory: true,
  category: { select: { name: true, slug: true } },
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

function buildWhere(params: CatalogParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  if (params.featured) {
    where.isFeatured = true;
  }

  if (params.category) {
    const slugs = (
      Array.isArray(params.category) ? params.category : [params.category]
    ).filter(Boolean);

    if (slugs.length > 0) {
      where.category = { slug: { in: slugs } };
    }
  }

  const search = params.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getCatalogProducts(params: CatalogParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(48, Math.max(1, params.limit ?? 24));
  const skip = (page - 1) * limit;
  const where = buildWhere(params);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: getOrderBy(params.sort),
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: true,
      inventory: true,
    },
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
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getBestSellerProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      inventory: true,
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
  images: { url: string }[];
  inventory?: { quantity: number } | null;
}) {
  return {
    slug: product.slug,
    name: product.name,
    price: product.price.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    imageUrl: product.images[0]?.url ?? null,
    inStock: product.inventory ? product.inventory.quantity > 0 : true,
  };
}

export function isInStock(inventory?: { quantity: number } | null) {
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

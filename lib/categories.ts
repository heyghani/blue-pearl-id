import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

const CATEGORY_REVALIDATE_SECONDS = 60;

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          products: {
            where: { isActive: true, deletedAt: null },
          },
        },
      },
    },
  });
}

export async function getActiveCategoryTree() {
  return unstable_cache(
    async () => {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            include: {
              _count: {
                select: {
                  products: {
                    where: { isActive: true, deletedAt: null },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              products: {
                where: { isActive: true, deletedAt: null },
              },
            },
          },
        },
      });

      return categories.filter((category) => !category.parentId);
    },
    ["active-category-tree"],
    { revalidate: CATEGORY_REVALIDATE_SECONDS, tags: ["categories"] },
  )();
}

export type HomepageCategoryItem = {
  slug: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
};

export function getHomepageCategoryItems(
  tree: Awaited<ReturnType<typeof getActiveCategoryTree>>,
): HomepageCategoryItem[] {
  const items: HomepageCategoryItem[] = [];

  for (const parent of tree) {
    const productiveChildren = parent.children.filter(
      (child) => child._count.products > 0,
    );

    if (productiveChildren.length > 0) {
      for (const child of productiveChildren) {
        items.push({
          slug: child.slug,
          name: child.name,
          imageUrl: child.imageUrl,
          productCount: child._count.products,
        });
      }
      continue;
    }

    if (parent._count.products > 0) {
      items.push({
        slug: parent.slug,
        name: parent.name,
        imageUrl: parent.imageUrl,
        productCount: parent._count.products,
      });
    }
  }

  return items;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function expandCategorySlugs(slugs: string[]): Promise<string[] | null> {
  if (slugs.length === 0) return [];

  const categories = await prisma.category.findMany({
    where: {
      slug: { in: slugs },
      isActive: true,
    },
    include: {
      children: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });

  const matchedSlugs = new Set(categories.map((category) => category.slug));
  if (!slugs.every((slug) => matchedSlugs.has(slug))) {
    return null;
  }

  const expanded = new Set<string>();

  for (const category of categories) {
    expanded.add(category.slug);
    for (const child of category.children) {
      expanded.add(child.slug);
    }
  }

  return [...expanded];
}

export async function getActiveBrands() {
  return unstable_cache(
    async () => {
      return prisma.brand.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              products: {
                where: { isActive: true, deletedAt: null },
              },
            },
          },
        },
      });
    },
    ["active-brands"],
    { revalidate: CATEGORY_REVALIDATE_SECONDS, tags: ["brands"] },
  )();
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findFirst({
    where: { slug, isActive: true },
  });
}

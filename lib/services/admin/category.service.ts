import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
};

const categoryListInclude = {
  parent: { select: { id: true, name: true } },
  _count: {
    select: {
      products: { where: { deletedAt: null } },
      children: true,
    },
  },
} satisfies Prisma.CategoryInclude;

export async function listAdminCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: categoryListInclude,
  });
}

export async function listAdminParentCategories(excludeId?: string) {
  return prisma.category.findMany({
    where: {
      parentId: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}

export async function getAdminCategory(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      children: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true, isActive: true },
      },
      _count: {
        select: {
          products: { where: { deletedAt: null } },
        },
      },
    },
  });
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: CategoryInput) {
  return prisma.category.update({
    where: { id },
    data: input,
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: { where: { deletedAt: null } },
          children: true,
        },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category._count.products > 0) {
    throw new Error("Remove or reassign products before deleting this category.");
  }

  if (category._count.children > 0) {
    throw new Error("Delete or reassign sub-categories first.");
  }

  return prisma.category.delete({ where: { id } });
}

export async function setCategoryActive(id: string, isActive: boolean) {
  return prisma.category.update({
    where: { id },
    data: { isActive },
    select: { slug: true },
  });
}

export async function listCategoriesForProductForm(includeCategoryId?: string | null) {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { isActive: true },
        ...(includeCategoryId ? [{ id: includeCategoryId }] : []),
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      parent: { select: { name: true } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.parent
      ? `${category.parent.name} → ${category.name}`
      : category.name,
  }));
}

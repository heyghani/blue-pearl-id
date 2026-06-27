import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type BrandInput = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

const brandListInclude = {
  _count: {
    select: {
      products: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.BrandInclude;

export async function listAdminBrands() {
  return prisma.brand.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: brandListInclude,
  });
}

export async function getAdminBrand(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: { where: { deletedAt: null } },
        },
      },
    },
  });
}

export async function createBrand(input: BrandInput) {
  return prisma.brand.create({ data: input });
}

export async function updateBrand(id: string, input: BrandInput) {
  return prisma.brand.update({
    where: { id },
    data: input,
  });
}

export async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!brand) {
    throw new Error("Brand not found.");
  }

  if (brand._count.products > 0) {
    throw new Error("Remove or reassign products before deleting this brand.");
  }

  return prisma.brand.delete({ where: { id } });
}

export async function setBrandActive(id: string, isActive: boolean) {
  return prisma.brand.update({
    where: { id },
    data: { isActive },
    select: { slug: true },
  });
}

export async function listBrandsForProductForm(includeBrandId?: string | null) {
  return prisma.brand.findMany({
    where: {
      OR: [
        { isActive: true },
        ...(includeBrandId ? [{ id: includeBrandId }] : []),
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

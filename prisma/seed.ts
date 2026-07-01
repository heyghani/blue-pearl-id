import { PrismaClient, ShippingMethodType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  buildVariantSku,
  cartesianProduct,
} from "../lib/products/variants";

const prisma = new PrismaClient();

const brands = [
  { name: "PrimeLuxr", slug: "primeluxr", sortOrder: 0 },
  { name: "Heritage", slug: "heritage", sortOrder: 1 },
];

const categories = [
  { name: "Necklaces", slug: "necklaces" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Rings", slug: "rings" },
  { name: "Sets", slug: "sets" },
  { name: "Footwear", slug: "footwear" },
  { name: "Accessories", slug: "accessories" },
];

const subCategories = [
  { name: "Casual Shoes", slug: "casual-shoes", parentSlug: null, sortOrder: 10 },
  { name: "Sandals", slug: "sandals", parentSlug: null, sortOrder: 11 },
  { name: "Canvas Shoes", slug: "canvas-shoes", parentSlug: null, sortOrder: 12 },
  { name: "Mesh", slug: "footwear-mesh", parentSlug: "casual-shoes", sortOrder: 0 },
  { name: "Cotton", slug: "footwear-cotton", parentSlug: "casual-shoes", sortOrder: 1 },
];

const products = [
  {
    name: "Akoya Pearl Strand Necklace",
    slug: "akoya-pearl-strand-necklace",
    sku: "BP-NK-001",
    price: 289,
    compareAtPrice: 349,
    isFeatured: true,
    categorySlug: "necklaces",
    shortDescription: "Classic 18-inch Akoya pearl strand with sterling silver clasp.",
  },
  {
    name: "South Sea Drop Earrings",
    slug: "south-sea-drop-earrings",
    sku: "BP-ER-001",
    price: 199,
    isFeatured: true,
    categorySlug: "earrings",
    shortDescription: "Elegant golden South Sea pearls on 14k gold hooks.",
  },
  {
    name: "Tahitian Pearl Bracelet",
    slug: "tahitian-pearl-bracelet",
    sku: "BP-BR-001",
    price: 159,
    isFeatured: true,
    categorySlug: "bracelets",
    shortDescription: "Hand-knotted Tahitian pearls with adjustable clasp.",
  },
  {
    name: "Freshwater Pearl Ring",
    slug: "freshwater-pearl-ring",
    sku: "BP-RG-001",
    price: 89,
    categorySlug: "rings",
    shortDescription: "Delicate freshwater pearl set in sterling silver.",
  },
  {
    name: "Pearl & Diamond Pendant",
    slug: "pearl-diamond-pendant",
    sku: "BP-NK-002",
    price: 449,
    compareAtPrice: 525,
    isFeatured: true,
    categorySlug: "necklaces",
    shortDescription: "Single Akoya pearl with accent diamond on white gold chain.",
  },
  {
    name: "Classic Pearl Stud Earrings",
    slug: "classic-pearl-stud-earrings",
    sku: "BP-ER-002",
    price: 129,
    categorySlug: "earrings",
    shortDescription: "Timeless 8mm Akoya pearl studs.",
  },
];

type VariantProductSeed = {
  name: string;
  slug: string;
  sku: string;
  basePrice: number;
  compareAtPrice?: number;
  isFeatured?: boolean;
  categorySlug: string;
  brandSlug?: string;
  tags?: string[];
  shortDescription: string;
  description?: string;
  imageUrl: string;
  options: { name: string; values: string[] }[];
  variantStock?: Record<string, number>;
  variantPrices?: Record<string, number>;
  variantImages?: Record<string, string>;
};

const variantProducts: VariantProductSeed[] = [
  {
    name: "Heritage Leather Sneaker",
    slug: "heritage-leather-sneaker",
    sku: "BP-SH-001",
    basePrice: 129,
    compareAtPrice: 159,
    isFeatured: true,
    categorySlug: "casual-shoes",
    brandSlug: "heritage",
    tags: ["Breathable", "Mesh", "Summer 2026", "Sports Trend"],
    shortDescription: "Minimal leather sneaker with cushioned insole — available in multiple colors and sizes.",
    description:
      "Demo product for client review: shows Color and Shoe size variants (e.g. for footwear catalog expansion).",
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    options: [
      { name: "Color", values: ["White", "Black", "Navy"] },
      { name: "Shoe size", values: ["38", "39", "40", "41", "42"] },
    ],
    variantStock: {
      "White|38": 4,
      "White|40": 8,
      "White|42": 2,
      "Black|39": 6,
      "Black|41": 5,
      "Navy|40": 3,
      "Navy|42": 0,
    },
    variantPrices: {
      "Black|42": 139,
    },
    variantImages: {
      "White|40":
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "Black|41":
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "Navy|40":
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    },
  },
  {
    name: "Adjustable Pearl Cuff Bracelet",
    slug: "adjustable-pearl-cuff-bracelet",
    sku: "BP-BR-002",
    basePrice: 79,
    isFeatured: true,
    categorySlug: "bracelets",
    shortDescription: "Open cuff with freshwater pearls — choose metal tone and wrist size.",
    description:
      "Jewelry example with variants: Color (metal finish) and Size for storefront option picker demo.",
    imageUrl:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    options: [
      { name: "Color", values: ["Gold", "Silver", "Rose Gold"] },
      { name: "Size", values: ["Small", "Medium", "Large"] },
    ],
    variantStock: {
      "Gold|Medium": 12,
      "Gold|Large": 6,
      "Silver|Small": 10,
      "Silver|Medium": 8,
      "Rose Gold|Medium": 4,
      "Rose Gold|Large": 0,
    },
    variantImages: {
      "Gold|Medium":
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
      "Silver|Small":
        "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80",
    },
  },
];

function variantKey(optionValues: Record<string, string>, optionNames: string[]) {
  return optionNames.map((name) => optionValues[name]).join("|");
}

function buildVariantRows(product: VariantProductSeed) {
  const combinations = cartesianProduct(
    product.options.map((option) =>
      option.values.map((value) => ({ optionName: option.name, value })),
    ),
  );

  const optionNames = product.options.map((option) => option.name);

  return combinations.map((combo) => {
    const optionValues = Object.fromEntries(
      combo.map(({ optionName, value }) => [optionName, value]),
    );
    const key = variantKey(optionValues, optionNames);

    return {
      optionValues,
      sku: buildVariantSku(product.sku, optionValues),
      price: product.variantPrices?.[key] ?? product.basePrice,
      quantity: product.variantStock?.[key] ?? 5,
      imageUrl: product.variantImages?.[key] ?? null,
      isActive: true,
    };
  });
}

async function clearProductVariants(productId: string) {
  await prisma.productVariantValue.deleteMany({
    where: { variant: { productId } },
  });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productOptionValue.deleteMany({
    where: { option: { productId } },
  });
  await prisma.productOption.deleteMany({ where: { productId } });
}

async function seedVariantProduct(product: VariantProductSeed) {
  const category = await prisma.category.findUnique({
    where: { slug: product.categorySlug },
  });
  const brand = product.brandSlug
    ? await prisma.brand.findUnique({ where: { slug: product.brandSlug } })
    : null;
  const variants = buildVariantRows(product);
  const totalQuantity = variants.reduce((sum, variant) => sum + variant.quantity, 0);
  const displayPrice = Math.min(...variants.map((variant) => variant.price));

  const existing = await prisma.product.findUnique({
    where: { slug: product.slug },
  });

  if (existing) {
    await clearProductVariants(existing.id);
  }

  const record = await prisma.product.upsert({
    where: { slug: product.slug },
    update: {
      name: product.name,
      sku: product.sku,
      price: displayPrice,
      compareAtPrice: product.compareAtPrice ?? null,
      hasVariants: true,
      isFeatured: product.isFeatured ?? false,
      shortDescription: product.shortDescription,
      description:
        product.description ??
        `${product.shortDescription} Each piece is carefully selected for luster, shape, and surface quality.`,
      categoryId: category?.id ?? null,
      brandId: brand?.id ?? null,
      tags: product.tags ?? [],
    },
    create: {
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: displayPrice,
      compareAtPrice: product.compareAtPrice ?? null,
      hasVariants: true,
      isFeatured: product.isFeatured ?? false,
      shortDescription: product.shortDescription,
      description:
        product.description ??
        `${product.shortDescription} Each piece is carefully selected for luster, shape, and surface quality.`,
      categoryId: category?.id ?? null,
      brandId: brand?.id ?? null,
      tags: product.tags ?? [],
      metadata: {
        specs: {
          Type: "Variant product",
          Options: product.options.map((option) => option.name).join(", "),
        },
      },
      images: {
        create: {
          url: product.imageUrl,
          alt: product.name,
          isPrimary: true,
        },
      },
      inventory: {
        create: { quantity: totalQuantity },
      },
    },
  });

  const primaryImage = await prisma.productImage.findFirst({
    where: { productId: record.id, isPrimary: true },
  });

  if (primaryImage) {
    await prisma.productImage.update({
      where: { id: primaryImage.id },
      data: { url: product.imageUrl, alt: product.name },
    });
  } else {
    await prisma.productImage.create({
      data: {
        productId: record.id,
        url: product.imageUrl,
        alt: product.name,
        isPrimary: true,
      },
    });
  }

  await prisma.inventory.upsert({
    where: { productId: record.id },
    create: { productId: record.id, quantity: totalQuantity },
    update: { quantity: totalQuantity },
  });

  const optionValueMap = new Map<string, string>();

  for (const [index, option] of product.options.entries()) {
    const createdOption = await prisma.productOption.create({
      data: {
        productId: record.id,
        name: option.name,
        position: index,
      },
    });

    for (const [valueIndex, value] of option.values.entries()) {
      const createdValue = await prisma.productOptionValue.create({
        data: {
          optionId: createdOption.id,
          value,
          position: valueIndex,
        },
      });
      optionValueMap.set(`${option.name}::${value}`, createdValue.id);
    }
  }

  for (const [index, variant] of variants.entries()) {
    const createdVariant = await prisma.productVariant.create({
      data: {
        productId: record.id,
        sku: variant.sku,
        price: variant.price,
        compareAtPrice: null,
        imageUrl: variant.imageUrl,
        quantity: variant.quantity,
        isActive: variant.isActive,
        sortOrder: index,
      },
    });

    const optionValueIds = Object.entries(variant.optionValues)
      .map(([optionName, value]) => optionValueMap.get(`${optionName}::${value}`))
      .filter((id): id is string => Boolean(id));

    await prisma.productVariantValue.createMany({
      data: optionValueIds.map((optionValueId) => ({
        variantId: createdVariant.id,
        optionValueId,
      })),
    });
  }

  return record;
}

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 12);

  await prisma.user.upsert({
    where: { email: "admin@primeluxr.com" },
    update: {},
    create: {
      email: "admin@primeluxr.com",
      name: "Admin",
      role: UserRole.ADMIN,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  for (const rate of [
    {
      method: ShippingMethodType.STANDARD,
      name: "Standard Shipping",
      description: "Worldwide delivery",
      price: 15,
      estimatedDaysMin: 10,
      estimatedDaysMax: 21,
      sortOrder: 0,
    },
    {
      method: ShippingMethodType.EXPRESS,
      name: "Express Shipping",
      description: "Priority worldwide delivery",
      price: 35,
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
      sortOrder: 1,
    },
  ]) {
    await prisma.shippingRate.upsert({
      where: { method: rate.method },
      update: rate,
      create: rate,
    });
  }

  for (const [index, brand] of brands.entries()) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { sortOrder: brand.sortOrder },
      create: { ...brand, sortOrder: brand.sortOrder },
    });
  }

  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { sortOrder: index },
      create: { ...category, sortOrder: index },
    });
  }

  for (const subCategory of subCategories) {
    const parent = subCategory.parentSlug
      ? await prisma.category.findUnique({
          where: { slug: subCategory.parentSlug },
        })
      : null;

    await prisma.category.upsert({
      where: { slug: subCategory.slug },
      update: {
        parentId: parent?.id ?? null,
        sortOrder: subCategory.sortOrder,
      },
      create: {
        name: subCategory.name,
        slug: subCategory.slug,
        parentId: parent?.id ?? null,
        sortOrder: subCategory.sortOrder,
      },
    });
  }

  const defaultBrand = await prisma.brand.findUnique({
    where: { slug: "primeluxr" },
  });

  for (const product of products) {
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        isFeatured: product.isFeatured,
        shortDescription: product.shortDescription,
        hasVariants: false,
        brandId: defaultBrand?.id ?? null,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        isFeatured: product.isFeatured ?? false,
        shortDescription: product.shortDescription,
        description: `${product.shortDescription} Each piece is carefully selected for luster, shape, and surface quality.`,
        categoryId: category?.id,
        brandId: defaultBrand?.id ?? null,
        hasVariants: false,
        metadata: {
          specs: {
            Material: "Cultured Pearl",
            Finish: "AAA Grade",
            Origin: "International",
          },
        },
        images: {
          create: {
            url: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80`,
            alt: product.name,
            isPrimary: true,
          },
        },
        inventory: {
          create: { quantity: 25 },
        },
      },
    });
  }

  for (const product of variantProducts) {
    await seedVariantProduct(product);
  }

  console.log("Seed complete.");
  console.log("Admin: admin@primeluxr.com / changeme123");
  console.log("");
  console.log("Variant demo products:");
  console.log("  • /products/heritage-leather-sneaker  (Color + Shoe size)");
  console.log("  • /products/adjustable-pearl-cuff-bracelet  (Color + Size)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

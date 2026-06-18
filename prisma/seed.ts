import { PrismaClient, ShippingMethodType, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Necklaces", slug: "necklaces" },
  { name: "Earrings", slug: "earrings" },
  { name: "Bracelets", slug: "bracelets" },
  { name: "Rings", slug: "rings" },
  { name: "Sets", slug: "sets" },
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

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 12);

  await prisma.user.upsert({
    where: { email: "admin@bluepearlid.com" },
    update: {},
    create: {
      email: "admin@bluepearlid.com",
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

  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { sortOrder: index },
      create: { ...category, sortOrder: index },
    });
  }

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

  console.log("Seed complete.");
  console.log("Admin: admin@bluepearlid.com / changeme123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

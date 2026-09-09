import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const seedPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/server/catalog/seed-data.json",
);
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

async function main() {
  const adminEmail = "admin@goshen.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "GoshenAdmin1!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Goshen Admin" },
    create: {
      email: adminEmail,
      name: "Goshen Admin",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "ADMIN",
    },
  });

  for (const category of seed.categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  // Drop categories that are no longer listed in seed-data.json, as long as
  // nothing is still filed under them.
  const keepSlugs = seed.categories.map((category) => category.slug);
  const stale = await prisma.category.findMany({
    where: { slug: { notIn: keepSlugs } },
    select: { id: true, slug: true, _count: { select: { products: true } } },
  });
  for (const category of stale) {
    if (category._count.products === 0) {
      await prisma.category.delete({ where: { id: category.id } });
    } else {
      console.warn(
        `Keeping category "${category.slug}" - ${category._count.products} product(s) still use it.`,
      );
    }
  }

  for (const product of seed.products) {
    const { images, ...rest } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: rest.name,
        description: rest.description,
        priceCents: rest.priceCents,
        unit: rest.unit,
        inStock: rest.inStock,
        featured: rest.featured,
        categoryId: rest.categoryId,
      },
      create: rest,
    });

    // Product photos are managed from the admin dashboard (Products -> Media),
    // not seeded. Only replace them here when seed-data.json actually lists some.
    if (images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.createMany({
        data: images.map((image) => ({
          productId: product.id,
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
        })),
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

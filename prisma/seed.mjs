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

  // Starter Nipz cake/pastry menu, as real rows the admin can edit, hide or
  // delete from /admin/cakes. Only seeded once, when the table is empty —
  // this never overwrites items the admin has since added or changed.
  const cakeItemCount = await prisma.cakeItem.count();
  if (cakeItemCount === 0) {
    const img = (id) =>
      `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

    await prisma.cakeItem.createMany({
      data: [
        {
          name: "Classic Celebration Cake",
          description:
            "Two or three tiers of moist vanilla or chocolate sponge, smooth buttercream, and a finish in your colours.",
          category: "Cakes",
          priceCents: 18_000,
          priceNote: "from",
          imageUrl: img("photo-1578985545062-69928b1d9587"),
          featured: true,
          sortOrder: 0,
        },
        {
          name: "Naked Berry Cake",
          description:
            "Lightly frosted sponge layered with fresh cream and seasonal berries — elegant for weddings and showers.",
          category: "Cakes",
          priceCents: 25_000,
          priceNote: "from",
          imageUrl: img("photo-1565958011703-44f9829ba187"),
          featured: true,
          sortOrder: 1,
        },
        {
          name: "Cupcake Box (12)",
          description:
            "A dozen swirled cupcakes in mixed flavours, boxed for gifting or a small gathering.",
          category: "Cupcakes",
          priceCents: 6_000,
          imageUrl: img("photo-1558961363-fa8fdf82db35"),
          sortOrder: 2,
        },
        {
          name: "French Macarons",
          description:
            "Crisp, chewy shells with ganache and fruit fillings. Sold by the box of 12 or 24.",
          category: "Pastries",
          priceCents: 5_500,
          priceNote: "from",
          imageUrl: img("photo-1519869325930-281384150729"),
          sortOrder: 3,
        },
        {
          name: "Breakfast Pastry Platter",
          description:
            "Croissants, palmiers, and cinnamon rolls baked the same morning — great for meetings and brunch.",
          category: "Pastries",
          priceCents: 9_000,
          priceNote: "from",
          imageUrl: img("photo-1486427944299-d1955d23e34d"),
          sortOrder: 4,
        },
        {
          name: "Dessert Table Spread",
          description:
            "A styled table of mini cakes, tarts, cake pops, and cupcakes, matched to your event theme.",
          category: "Dessert tables",
          priceNote: "Quote on request",
          imageUrl: img("photo-1464349095431-e9a21285b5f3"),
          featured: true,
          sortOrder: 5,
        },
      ],
    });
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

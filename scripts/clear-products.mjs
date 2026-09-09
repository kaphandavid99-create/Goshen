/**
 * Deletes every product from the database.
 *
 *   node scripts/clear-products.mjs
 *
 * Removes products and everything that hangs off them (images, reviews,
 * wishlist entries). Past order line-items are kept for order history; their
 * product link is set to null. Categories are left in place.
 *
 * Add products back from the admin dashboard, or re-populate
 * src/server/catalog/seed-data.json and run `npm run db:seed`.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const before = await prisma.product.count();
  console.log(`Products in database: ${before}`);

  if (before === 0) {
    return;
  }

  const reviews = await prisma.review.deleteMany({});
  const wishlist = await prisma.wishlistItem.deleteMany({});
  const images = await prisma.productImage.deleteMany({});
  const unlinked = await prisma.orderItem.updateMany({
    where: { productId: { not: null } },
    data: { productId: null },
  });
  const products = await prisma.product.deleteMany({});

  console.log(`  reviews removed:        ${reviews.count}`);
  console.log(`  wishlist items removed: ${wishlist.count}`);
  console.log(`  product images removed: ${images.count}`);
  console.log(`  order items unlinked:   ${unlinked.count}`);
  console.log(`  products removed:       ${products.count}`);
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

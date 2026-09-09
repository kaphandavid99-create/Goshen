/**
 * Removes every product image from the database.
 *
 *   node scripts/clear-product-images.mjs            # delete DB rows only
 *   node scripts/clear-product-images.mjs --cloudinary  # also destroy the Cloudinary assets
 *
 * After running, upload fresh photos per product from the admin dashboard:
 *   Admin -> Products -> "Media" on a row.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const alsoCloudinary = process.argv.includes("--cloudinary");

function loadEnv() {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), "../.env");
  try {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // no .env file, rely on the ambient environment
  }
}

async function destroyCloudinaryAssets(images) {
  const withPublicId = images.filter((image) => image.cloudinaryPublicId);
  if (withPublicId.length === 0) {
    return;
  }

  loadEnv();
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  for (const image of withPublicId) {
    const type = image.resourceType === "video" ? "video" : "image";
    try {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId, {
        resource_type: type,
      });
      console.log(`  destroyed ${type} ${image.cloudinaryPublicId}`);
    } catch (error) {
      console.warn(
        `  could not destroy ${image.cloudinaryPublicId}: ${error?.message ?? error}`,
      );
    }
  }
}

async function main() {
  const images = await prisma.productImage.findMany();
  console.log(`Found ${images.length} product image(s).`);

  if (images.length === 0) {
    return;
  }

  if (alsoCloudinary) {
    await destroyCloudinaryAssets(images);
  }

  const { count } = await prisma.productImage.deleteMany({});
  console.log(`Deleted ${count} row(s) from productImage.`);
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

-- CreateEnum
CREATE TYPE "public"."ProductKind" AS ENUM ('SIMPLE', 'BUNDLE');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "kind" "public"."ProductKind" NOT NULL DEFAULT 'SIMPLE';

-- CreateTable
CREATE TABLE "public"."BundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BundleItem_bundleId_idx" ON "public"."BundleItem"("bundleId");

-- CreateIndex
CREATE INDEX "BundleItem_productId_idx" ON "public"."BundleItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "BundleItem_bundleId_productId_key" ON "public"."BundleItem"("bundleId", "productId");

-- CreateIndex
CREATE INDEX "Product_kind_idx" ON "public"."Product"("kind");

-- AddForeignKey
ALTER TABLE "public"."BundleItem" ADD CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BundleItem" ADD CONSTRAINT "BundleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the Bundles category so /bundles and the admin bundle form work without a
-- separate seed run. Kept in sync with prisma/seed.mjs via seed-data.json.
INSERT INTO "public"."Category" ("id", "name", "slug", "description")
VALUES (
  'bundles-category',
  'Bundles',
  'bundles',
  'Ready-made sets of products at one price.'
)
ON CONFLICT ("slug") DO NOTHING;

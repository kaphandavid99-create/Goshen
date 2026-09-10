-- CreateTable
CREATE TABLE "public"."NipzSettings" (
    "id" TEXT NOT NULL DEFAULT 'nipz',
    "businessName" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEm" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NipzSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NipzImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NipzImage_pkey" PRIMARY KEY ("id")
);

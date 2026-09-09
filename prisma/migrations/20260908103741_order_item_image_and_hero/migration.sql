-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `imageUrl` TEXT NULL;

-- CreateTable
CREATE TABLE `HeroSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'hero',
    `kicker` VARCHAR(191) NOT NULL,
    `headline` VARCHAR(191) NOT NULL,
    `rotatingLines` JSON NOT NULL,
    `lead` TEXT NOT NULL,
    `primaryCtaLabel` VARCHAR(191) NOT NULL,
    `primaryCtaHref` VARCHAR(191) NOT NULL,
    `secondaryCtaLabel` VARCHAR(191) NOT NULL,
    `secondaryCtaHref` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeroImage` (
    `id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `alt` VARCHAR(191) NOT NULL,
    `cloudinaryPublicId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

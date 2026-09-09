-- AlterTable
ALTER TABLE `product` ADD COLUMN `lowStockAt` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `stockCount` INTEGER NOT NULL DEFAULT 0;

-- Initialise stockCount from the existing inStock flag (staff set real counts in /admin/inventory)
UPDATE `product` SET `stockCount` = IF(`inStock`, 25, 0);

-- CreateTable
CREATE TABLE `AdminActivity` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminActivity_createdAt_idx`(`createdAt`),
    INDEX `AdminActivity_actorId_idx`(`actorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminActivity` ADD CONSTRAINT `AdminActivity_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

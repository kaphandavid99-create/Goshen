-- CreateTable
CREATE TABLE `CakeItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Cakes',
    `priceCents` INTEGER NULL,
    `priceNote` VARCHAR(191) NULL,
    `imageUrl` TEXT NOT NULL,
    `cloudinaryPublicId` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CakeItem_sortOrder_idx`(`sortOrder`),
    INDEX `CakeItem_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CakeBooking` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `occasion` VARCHAR(191) NULL,
    `flavor` VARCHAR(191) NULL,
    `servings` VARCHAR(191) NULL,
    `eventDate` DATETIME(3) NULL,
    `fulfillment` ENUM('DELIVERY', 'PICKUP') NOT NULL DEFAULT 'PICKUP',
    `budgetCents` INTEGER NULL,
    `details` TEXT NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CakeBooking_reference_key`(`reference`),
    INDEX `CakeBooking_userId_idx`(`userId`),
    INDEX `CakeBooking_status_idx`(`status`),
    INDEX `CakeBooking_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CakeBooking` ADD CONSTRAINT `CakeBooking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

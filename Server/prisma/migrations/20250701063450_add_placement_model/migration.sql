-- AlterTable
ALTER TABLE `student` ADD COLUMN `status` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Placement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `position` VARCHAR(191) NOT NULL,
    `salaryPackage` DOUBLE NOT NULL,
    `location` VARCHAR(191) NULL,
    `offerDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Placement_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Placement` ADD CONSTRAINT `Placement_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

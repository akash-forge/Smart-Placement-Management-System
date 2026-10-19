-- AlterTable
ALTER TABLE `Staff` ADD COLUMN `staffId` VARCHAR(191) NULL,
    MODIFY `designation` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Staff_staffId_key` ON `Staff`(`staffId`);

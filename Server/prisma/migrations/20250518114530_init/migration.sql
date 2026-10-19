-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `registerNumber` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `batch` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `resumeUrl` VARCHAR(191) NULL,
    `cgpa` DOUBLE NULL,
    `skills` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_email_key`(`email`),
    UNIQUE INDEX `Student_registerNumber_key`(`registerNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

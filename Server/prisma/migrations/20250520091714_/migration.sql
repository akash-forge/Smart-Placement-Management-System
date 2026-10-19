-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `requirements` VARCHAR(191) NOT NULL,
    `responsibilities` VARCHAR(191) NOT NULL,
    `postedDate` DATETIME(3) NOT NULL,
    `salaryMin` DOUBLE NULL,
    `salaryMax` DOUBLE NULL,
    `employmentType` VARCHAR(191) NOT NULL,
    `benefits` VARCHAR(191) NOT NULL,
    `applicationDeadline` DATETIME(3) NOT NULL,
    `contactEmail` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

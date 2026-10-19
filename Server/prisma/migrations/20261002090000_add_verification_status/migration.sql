-- CreateEnum equivalent for MySQL: Prisma represents enums as a native
-- MySQL ENUM column, declared inline on each table that uses it.

-- Staff: add verificationStatus
ALTER TABLE `Staff` ADD COLUMN `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- Student: add verificationStatus
ALTER TABLE `Student` ADD COLUMN `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- Company: replace isVerified (Boolean) with verificationStatus (enum).
-- Existing isVerified = true becomes VERIFIED, false becomes PENDING, so no
-- company that was already approved loses that status in the migration.
ALTER TABLE `Company` ADD COLUMN `verificationStatus` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
UPDATE `Company` SET `verificationStatus` = 'VERIFIED' WHERE `isVerified` = true;
ALTER TABLE `Company` DROP COLUMN `isVerified`;

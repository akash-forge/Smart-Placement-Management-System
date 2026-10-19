/*
  Warnings:

  - You are about to drop the column `salaryMax` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `salaryMin` on the `job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `salaryMax`,
    DROP COLUMN `salaryMin`,
    MODIFY `benefits` VARCHAR(191) NULL;

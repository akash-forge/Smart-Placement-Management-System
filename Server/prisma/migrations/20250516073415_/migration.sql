/*
  Warnings:

  - Made the column `designation` on table `staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `staff` MODIFY `designation` VARCHAR(191) NOT NULL;

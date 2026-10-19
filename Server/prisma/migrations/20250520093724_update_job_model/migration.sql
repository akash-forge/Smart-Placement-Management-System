/*
  Warnings:

  - You are about to alter the column `requirements` on the `job` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `responsibilities` on the `job` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `benefits` on the `job` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `job` ADD COLUMN `salaryMax` INTEGER NULL,
    ADD COLUMN `salaryMin` INTEGER NULL,
    MODIFY `requirements` JSON NOT NULL,
    MODIFY `responsibilities` JSON NOT NULL,
    MODIFY `benefits` JSON NULL;

/*
  Warnings:

  - Made the column `status` on table `student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `student` MODIFY `status` ENUM('PLACED', 'UNPLACED') NOT NULL DEFAULT 'UNPLACED';

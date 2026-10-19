/*
  Warnings:

  - You are about to drop the `placement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `placement` DROP FOREIGN KEY `Placement_studentId_fkey`;

-- DropTable
DROP TABLE `placement`;

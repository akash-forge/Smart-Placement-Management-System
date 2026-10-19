-- AlterTable
ALTER TABLE `Job` ADD COLUMN `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Note: existing job rows will have companyId = NULL — there's no reliable
-- way to backfill this automatically, since the old `company` column is
-- free text (e.g. "Google") with no guaranteed match to a real Company
-- account's name. Jobs posted before this migration can only be
-- edited/deleted by Staff/Admin until a Company re-claims them (or you
-- backfill companyId by hand for known matches).

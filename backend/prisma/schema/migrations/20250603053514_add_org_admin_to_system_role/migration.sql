/*
  Warnings:

  - Made the column `contactId` on table `AlternateContact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "SystemRole" ADD VALUE 'ORG_ADMIN';

-- DropIndex
DROP INDEX "AlternateContact_userId_key";

-- AlterTable
ALTER TABLE "AlternateContact" ALTER COLUMN "contactId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AlternateContact" ADD CONSTRAINT "AlternateContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `contactNo` on the `AlternateContact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlternateContact" DROP COLUMN "contactNo",
ADD COLUMN     "contactId" TEXT;

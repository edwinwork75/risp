/*
  Warnings:

  - You are about to drop the column `contactId` on the `AlternateContact` table. All the data in the column will be lost.
  - Added the required column `contactNo` to the `AlternateContact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AlternateContact" DROP COLUMN "contactId",
ADD COLUMN     "contactNo" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `contactId` on the `AlternateContact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `AlternateContact` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AlternateContact" DROP COLUMN "contactId",
ADD COLUMN     "contactNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AlternateContact_userId_key" ON "AlternateContact"("userId");

/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Assessment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Assessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_slug_key" ON "Assessment"("slug");

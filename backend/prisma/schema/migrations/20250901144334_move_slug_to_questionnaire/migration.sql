/*
  Warnings:

  - You are about to drop the column `slug` on the `AssessmentSchedule` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Questionnaire` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Questionnaire` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AssessmentSchedule_slug_key";

-- AlterTable
ALTER TABLE "AssessmentSchedule" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Questionnaire" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Questionnaire_slug_key" ON "Questionnaire"("slug");

/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `questionnaire` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `AssessmentAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `AssessmentAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `userGroupId` on the `AssessmentAssignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,assessmentId]` on the table `AssessmentAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assessmentScheduleId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `AssessmentAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AssessmentAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_updatedBy_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_userGroupId_fkey";

-- DropIndex
DROP INDEX "Assessment_slug_key";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "createdBy",
DROP COLUMN "description",
DROP COLUMN "questionnaire",
DROP COLUMN "slug",
DROP COLUMN "title",
DROP COLUMN "updatedBy",
ADD COLUMN     "assessmentScheduleId" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentAssignment" DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "userGroupId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "submittedBy" DROP NOT NULL,
ALTER COLUMN "responses" DROP NOT NULL,
ALTER COLUMN "report" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questionnaire" JSONB NOT NULL,
    "minSpanDays" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSchedule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questionnaireId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "AssessmentSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentScheduleAssignment" (
    "id" TEXT NOT NULL,
    "userGroupId" TEXT NOT NULL,
    "assessmentScheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentScheduleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSchedule_slug_key" ON "AssessmentSchedule"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentScheduleAssignment_userGroupId_assessmentSchedule_key" ON "AssessmentScheduleAssignment"("userGroupId", "assessmentScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAssignment_userId_assessmentId_key" ON "AssessmentAssignment"("userId", "assessmentId");

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questionnaire" ADD CONSTRAINT "Questionnaire_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSchedule" ADD CONSTRAINT "AssessmentSchedule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSchedule" ADD CONSTRAINT "AssessmentSchedule_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSchedule" ADD CONSTRAINT "AssessmentSchedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSchedule" ADD CONSTRAINT "AssessmentSchedule_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScheduleAssignment" ADD CONSTRAINT "AssessmentScheduleAssignment_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "AssessmentGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentScheduleAssignment" ADD CONSTRAINT "AssessmentScheduleAssignment_assessmentScheduleId_fkey" FOREIGN KEY ("assessmentScheduleId") REFERENCES "AssessmentSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_assessmentScheduleId_fkey" FOREIGN KEY ("assessmentScheduleId") REFERENCES "AssessmentSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

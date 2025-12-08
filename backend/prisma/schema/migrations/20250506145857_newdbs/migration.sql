/*
  Warnings:

  - You are about to drop the column `organisationId` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `questions` on the `Assessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessmentProjectAssignmentId` on the `AssessmentAssignment` table. All the data in the column will be lost.
  - You are about to drop the `AssessmentProjectAssignment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `projectId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionnaire` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessmentId` to the `AssessmentAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assessment" DROP CONSTRAINT "Assessment_organisationId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_assessmentProjectAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentAssignment" DROP CONSTRAINT "AssessmentAssignment_userGroupId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentProjectAssignment" DROP CONSTRAINT "AssessmentProjectAssignment_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentProjectAssignment" DROP CONSTRAINT "AssessmentProjectAssignment_assignedBy_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentProjectAssignment" DROP CONSTRAINT "AssessmentProjectAssignment_assignedToGroup_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentProjectAssignment" DROP CONSTRAINT "AssessmentProjectAssignment_assignedToUser_fkey";

-- DropForeignKey
ALTER TABLE "AssessmentProjectAssignment" DROP CONSTRAINT "AssessmentProjectAssignment_projectId_fkey";

-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "organisationId",
DROP COLUMN "questions",
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "questionnaire" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentAssignment" DROP COLUMN "assessmentProjectAssignmentId",
ADD COLUMN     "assessmentId" TEXT NOT NULL,
ALTER COLUMN "userGroupId" DROP NOT NULL;

-- DropTable
DROP TABLE "AssessmentProjectAssignment";

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "AssessmentGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

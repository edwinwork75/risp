/*
  Warnings:

  - Added the required column `accessCode` to the `AssessmentAssignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessSecret` to the `AssessmentAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssessmentAssignment" ADD COLUMN     "accessCode" TEXT NOT NULL,
ADD COLUMN     "accessSecret" TEXT NOT NULL;

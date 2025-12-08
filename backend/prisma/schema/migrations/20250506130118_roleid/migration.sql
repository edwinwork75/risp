-- DropForeignKey
ALTER TABLE "AssessmentGroup" DROP CONSTRAINT "AssessmentGroup_managerId_fkey";

-- AddForeignKey
ALTER TABLE "AssessmentGroup" ADD CONSTRAINT "AssessmentGroup_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

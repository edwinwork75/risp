/*
  Warnings:

  - A unique constraint covering the columns `[organisationId,userId]` on the table `OrgUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrgUser_organisationId_userId_key" ON "OrgUser"("organisationId", "userId");

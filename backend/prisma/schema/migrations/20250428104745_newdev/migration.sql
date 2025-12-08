/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `OrgUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organisationId]` on the table `OrgUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `UserToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OrgUser_userId_key" ON "OrgUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrgUser_organisationId_key" ON "OrgUser"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_userId_key" ON "UserToken"("userId");

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPERVISOR';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GroupSupervisors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupSupervisors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Group_organizationId_idx" ON "Group"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_organizationId_name_key" ON "Group"("organizationId", "name");

-- CreateIndex
CREATE INDEX "_GroupSupervisors_B_index" ON "_GroupSupervisors"("B");

-- CreateIndex
CREATE INDEX "User_groupId_idx" ON "User"("groupId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupSupervisors" ADD CONSTRAINT "_GroupSupervisors_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupSupervisors" ADD CONSTRAINT "_GroupSupervisors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

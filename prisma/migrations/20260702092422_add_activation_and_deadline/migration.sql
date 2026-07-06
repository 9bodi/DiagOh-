/*
  Warnings:

  - The values [NOT_STARTED,RESET] on the enum `TestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TestStatus_new" AS ENUM ('PENDING', 'READY_TO_START', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED');
ALTER TABLE "public"."TestSession" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "TestSession" ALTER COLUMN "status" TYPE "TestStatus_new" USING ("status"::text::"TestStatus_new");
ALTER TYPE "TestStatus" RENAME TO "TestStatus_old";
ALTER TYPE "TestStatus_new" RENAME TO "TestStatus";
DROP TYPE "public"."TestStatus_old";
ALTER TABLE "TestSession" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "activatedBy" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "reminderJ1SentAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "TestSession_deadline_idx" ON "TestSession"("deadline");

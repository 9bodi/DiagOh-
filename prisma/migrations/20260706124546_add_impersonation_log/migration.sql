-- CreateTable
CREATE TABLE "ImpersonationLog" (
    "id" TEXT NOT NULL,
    "superadminId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ImpersonationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpersonationLog_superadminId_idx" ON "ImpersonationLog"("superadminId");

-- CreateIndex
CREATE INDEX "ImpersonationLog_organizationId_idx" ON "ImpersonationLog"("organizationId");

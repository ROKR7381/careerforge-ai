-- AlterTable
ALTER TABLE "SavedJob" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE INDEX "SavedJob_userId_createdAt_idx" ON "SavedJob"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_userId_externalId_key" ON "SavedJob"("userId", "externalId");

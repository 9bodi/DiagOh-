/*
  Warnings:

  - You are about to drop the column `currentQuestionServed` on the `TestSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestSession" DROP COLUMN "currentQuestionServed",
ADD COLUMN     "currentQuestionServedCount" INTEGER NOT NULL DEFAULT 0;

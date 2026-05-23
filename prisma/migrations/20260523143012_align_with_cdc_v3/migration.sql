/*
  Warnings:

  - The values [RELEVANCE] on the enum `DeclarativeAxis` will be removed. If these variants are still used in the database, this will fail.
  - The values [ORTHOGRAPHE_LEXICALE,ORTHOGRAPHE_GRAMMATICALE,CONJUGAISON,SYNTAXE,PONCTUATION,VOCABULAIRE] on the enum `QuestionCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeclarativeAxis_new" AS ENUM ('ADAPTATION', 'INTEREST');
ALTER TABLE "Question" ALTER COLUMN "declarativeAxis" TYPE "DeclarativeAxis_new" USING ("declarativeAxis"::text::"DeclarativeAxis_new");
ALTER TYPE "DeclarativeAxis" RENAME TO "DeclarativeAxis_old";
ALTER TYPE "DeclarativeAxis_new" RENAME TO "DeclarativeAxis";
DROP TYPE "public"."DeclarativeAxis_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionCategory_new" AS ENUM ('SINGULAR_PLURAL', 'CONJUGATION', 'PAST_PARTICIPLE', 'SPELLING', 'SYNTAX', 'COMPREHENSION', 'DECLARATIVE');
ALTER TABLE "Question" ALTER COLUMN "category" TYPE "QuestionCategory_new" USING ("category"::text::"QuestionCategory_new");
ALTER TYPE "QuestionCategory" RENAME TO "QuestionCategory_old";
ALTER TYPE "QuestionCategory_new" RENAME TO "QuestionCategory";
DROP TYPE "public"."QuestionCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "blockNumber" INTEGER,
ADD COLUMN     "sourceText" TEXT;

-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "scoreAdaptation" INTEGER,
ADD COLUMN     "scoreBloc1" DOUBLE PRECISION,
ADD COLUMN     "scoreBloc2" DOUBLE PRECISION,
ADD COLUMN     "scoreBloc3" DOUBLE PRECISION,
ADD COLUMN     "scoreBloc4" DOUBLE PRECISION,
ADD COLUMN     "scoreBloc5" DOUBLE PRECISION,
ADD COLUMN     "scoreBloc6" DOUBLE PRECISION,
ADD COLUMN     "scoreInteret" INTEGER,
ALTER COLUMN "scoreProcedural" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Question_blockNumber_idx" ON "Question"("blockNumber");

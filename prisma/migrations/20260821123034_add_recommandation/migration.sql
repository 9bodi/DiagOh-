-- CreateEnum
CREATE TYPE "Recommandation" AS ENUM ('A_FORMER', 'A_FORMER_ET_ACCOMPAGNER', 'A_FORMER_SOUS_RESERVES', 'A_ORIENTER');

-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "recommandation" "Recommandation";

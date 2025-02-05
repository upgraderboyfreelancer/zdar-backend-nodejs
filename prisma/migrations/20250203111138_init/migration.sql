/*
  Warnings:

  - The values [SUSPEND] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `applicantId` on the `AcademicBackground` table. All the data in the column will be lost.
  - You are about to drop the column `pic` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `applicantId` on the `ProfessionalExperience` table. All the data in the column will be lost.
  - You are about to drop the `Applicant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[candidateId]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `candidateId` to the `AcademicBackground` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidateId` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `candidateId` to the `ProfessionalExperience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('ACTIVE', 'SUSPENDED');
ALTER TABLE "Job" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Job" ALTER COLUMN "status" TYPE "Status_new" USING ("status"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Job" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "AcademicBackground" DROP CONSTRAINT "AcademicBackground_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_jobId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalExperience" DROP CONSTRAINT "ProfessionalExperience_applicantId_fkey";

-- AlterTable
ALTER TABLE "AcademicBackground" DROP COLUMN "applicantId",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ALTER COLUMN "period" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "pic",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "hardSkills" TEXT[],
ADD COLUMN     "hobbies" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "profileType" TEXT,
ADD COLUMN     "resume" TEXT,
ADD COLUMN     "softSkills" TEXT[];

-- AlterTable
ALTER TABLE "ProfessionalExperience" DROP COLUMN "applicantId",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ALTER COLUMN "period" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Applicant";

-- CreateTable
CREATE TABLE "AppliedJobs" (
    "_id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" "APPLICANT_STATUS" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppliedJobs_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppliedJobs_candidateId_jobId_key" ON "AppliedJobs"("candidateId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_candidateId_key" ON "Candidate"("candidateId");

-- AddForeignKey
ALTER TABLE "ProfessionalExperience" ADD CONSTRAINT "ProfessionalExperience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicBackground" ADD CONSTRAINT "AcademicBackground_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedJobs" ADD CONSTRAINT "AppliedJobs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppliedJobs" ADD CONSTRAINT "AppliedJobs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

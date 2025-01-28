-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'COMPANY');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'ENTERPRISE', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "SubscriptionPeriod" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'SUSPEND');

-- CreateEnum
CREATE TYPE "APPLICANT_STATUS" AS ENUM ('PENDING', 'SHORTLISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DIS" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "users" (
    "_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "_id" TEXT NOT NULL,
    "pic" TEXT,
    "linkedIn" TEXT,
    "countryName" TEXT,
    "cityName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "presentation" TEXT,
    "contractType" TEXT,
    "sectorPref" TEXT,
    "positionName" TEXT,
    "disability" "DIS" DEFAULT 'NO',
    "age" TEXT,
    "experience" TEXT,
    "salaryExpectation" TEXT,
    "userId" TEXT NOT NULL,
    "portfolioLink" TEXT,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "_id" SERIAL NOT NULL,
    "profileType" TEXT,
    "contractType" TEXT,
    "salaryExpectation" TEXT,
    "hardSkills" TEXT[],
    "softSkills" TEXT[],
    "resume" TEXT,
    "hobbies" TEXT[],
    "candidateId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "status" "APPLICANT_STATUS" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "ProfessionalExperience" (
    "_id" SERIAL NOT NULL,
    "positionName" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "applicantId" INTEGER NOT NULL,

    CONSTRAINT "ProfessionalExperience_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "AcademicBackground" (
    "_id" SERIAL NOT NULL,
    "instituteName" TEXT NOT NULL,
    "speciality" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "applicantId" INTEGER NOT NULL,

    CONSTRAINT "AcademicBackground_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Company" (
    "_id" TEXT NOT NULL,
    "logo" TEXT,
    "websiteLink" TEXT,
    "companyName" TEXT,
    "sector" TEXT,
    "countryName" TEXT,
    "cityName" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gender" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "presentation" TEXT,
    "userId" TEXT NOT NULL,
    "customerId" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Job" (
    "_id" SERIAL NOT NULL,
    "positionName" TEXT NOT NULL,
    "jobOffer" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "genderPref" TEXT NOT NULL,
    "disable" BOOLEAN NOT NULL,
    "ageLimit" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "annualSalary" TEXT NOT NULL,
    "monthly" TEXT NOT NULL,
    "hardSkills" TEXT[],
    "softSkills" TEXT[],
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "_id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "period" "SubscriptionPeriod" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "_id" SERIAL NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_userId_key" ON "Candidate"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_candidateId_key" ON "Applicant"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_customerId_key" ON "Company"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "VerificationToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_candidateId_jobId_key" ON "Favorite"("candidateId", "jobId");

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalExperience" ADD CONSTRAINT "ProfessionalExperience_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicBackground" ADD CONSTRAINT "AcademicBackground_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

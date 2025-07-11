-- CreateEnum
CREATE TYPE "industry_type" AS ENUM ('CONSTRUCTION', 'AUTOMOTIVE', 'HOSPITALITY', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "worker_status" AS ENUM ('NOT_CALLED', 'CALLED', 'COMPLETED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "call_status" AS ENUM ('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vapiApiKey" TEXT,
    "vapiPhoneNumberId" TEXT,
    "constructionAssistantId" TEXT,
    "automotiveAssistantId" TEXT,
    "hospitalityAssistantId" TEXT,
    "fromEmail" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
    "defaultCallTime" TEXT NOT NULL DEFAULT '09:00',
    "workdays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobSite" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "industryType" "industry_type" NOT NULL,
    "supervisorEmail" TEXT NOT NULL,
    "status" "worker_status" NOT NULL DEFAULT 'NOT_CALLED',
    "timezone" TEXT NOT NULL DEFAULT 'Australia/Sydney',
    "preferredCallTime" TEXT NOT NULL DEFAULT '09:00',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCallDate" TIMESTAMP(3),
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "avgCallDuration" DOUBLE PRECISION,
    "responseRate" DOUBLE PRECISION,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "vapiCallId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "workerName" TEXT NOT NULL,
    "jobSite" TEXT NOT NULL,
    "industryType" "industry_type" NOT NULL,
    "assistantType" TEXT NOT NULL,
    "status" "call_status" NOT NULL DEFAULT 'INITIATED',
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "endReason" TEXT,
    "transcript" TEXT,
    "summary" TEXT,
    "recordingUrl" TEXT,
    "s3RecordingKey" TEXT,
    "sentiment" TEXT,
    "keyTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "complianceFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "workerId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_calls" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" TIMESTAMP(3),
    "callId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "calls_vapiCallId_key" ON "calls"("vapiCallId");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

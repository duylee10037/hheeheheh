-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('PYTHON', 'CPP');

-- AlterTable
ALTER TABLE "License"
ADD COLUMN "type" "LicenseType" NOT NULL DEFAULT 'PYTHON';

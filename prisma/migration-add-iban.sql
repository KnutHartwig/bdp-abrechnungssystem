-- Migration: Add IBAN field to abrechnungen table
-- Run this migration after deploying the code

ALTER TABLE "abrechnungen" ADD COLUMN IF NOT EXISTS "iban" TEXT NOT NULL DEFAULT '';

-- Optional: Update existing records with a default IBAN if needed
-- UPDATE "abrechnungen" SET "iban" = 'DE00000000000000000000' WHERE "iban" = '';

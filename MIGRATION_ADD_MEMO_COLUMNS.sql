-- Migration: Add document_title and show_from_to columns to memos table
-- Run this script in Supabase SQL Editor

-- 1. Add document_title column
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS document_title TEXT DEFAULT 'MEMO INTERNAL';

-- Update existing records to have default value
UPDATE memos 
SET document_title = 'MEMO INTERNAL' 
WHERE document_title IS NULL;

-- Add comment to column
COMMENT ON COLUMN memos.document_title IS 'Custom document title (e.g., MEMO INTERNAL, SURAT PERINGATAN, SURAT PERNYATAAN, SURAT PINDAH SEKOLAH)';

-- 2. Add show_from_to column
ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS show_from_to BOOLEAN DEFAULT true;

-- Update existing records to show the section by default
UPDATE memos 
SET show_from_to = true 
WHERE show_from_to IS NULL;

-- Add comment to column
COMMENT ON COLUMN memos.show_from_to IS 'Toggle to show/hide "Dari" and "Kepada" section in the document';

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name IN ('document_title', 'show_from_to');

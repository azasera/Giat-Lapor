-- Add document_title column to memos table
-- This allows custom titles like "MEMO INTERNAL", "SURAT PERINGATAN", "SURAT PERNYATAAN", etc.

ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS document_title TEXT DEFAULT 'MEMO INTERNAL';

-- Update existing records to have default value
UPDATE memos 
SET document_title = 'MEMO INTERNAL' 
WHERE document_title IS NULL;

-- Add comment to column
COMMENT ON COLUMN memos.document_title IS 'Custom document title (e.g., MEMO INTERNAL, SURAT PERINGATAN, SURAT PERNYATAAN, SURAT PINDAH SEKOLAH)';

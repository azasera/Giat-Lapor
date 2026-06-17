-- Add Mudir Signature, Mudir Stamp, and Mudir Name columns to memos table
-- This allows adding approval from Mudir on the left side of the memo

ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS mudir_signature_url TEXT,
ADD COLUMN IF NOT EXISTS mudir_stamp_url TEXT,
ADD COLUMN IF NOT EXISTS mudir_name TEXT;

-- Add comment to columns
COMMENT ON COLUMN memos.mudir_signature_url IS 'URL of Mudir signature image';
COMMENT ON COLUMN memos.mudir_stamp_url IS 'URL of Mudir stamp image';
COMMENT ON COLUMN memos.mudir_name IS 'Name of the Mudir for approval';

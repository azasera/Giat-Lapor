-- Add show_from_to column to memos table
-- This allows hiding the "Dari" and "Kepada" section for certain letter types

ALTER TABLE memos 
ADD COLUMN IF NOT EXISTS show_from_to BOOLEAN DEFAULT true;

-- Update existing records to show the section by default
UPDATE memos 
SET show_from_to = true 
WHERE show_from_to IS NULL;

-- Add comment to column
COMMENT ON COLUMN memos.show_from_to IS 'Toggle to show/hide "Dari" and "Kepada" section in the document';

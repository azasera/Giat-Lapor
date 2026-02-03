-- Add sent_to_foundation_at column to memos table
-- This tracks when a memo was sent to foundation

ALTER TABLE memos 
ADD COLUMN sent_to_foundation_at TIMESTAMP WITH TIME ZONE;

-- Update existing memos with 'sent_to_foundation' status to have a timestamp
UPDATE memos 
SET sent_to_foundation_at = updated_at 
WHERE status = 'sent_to_foundation' AND sent_to_foundation_at IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN memos.sent_to_foundation_at IS 'Timestamp when memo was sent to foundation';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name = 'sent_to_foundation_at';
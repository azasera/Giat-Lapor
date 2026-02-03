-- Check if sent_to_foundation_at column exists
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name = 'sent_to_foundation_at';

-- Check current memo statuses
SELECT status, COUNT(*) as count 
FROM memos 
GROUP BY status;

-- Check if there are any memos with sent_to_foundation status
SELECT id, memo_number, status, user_id, created_at, updated_at
FROM memos 
WHERE status = 'sent_to_foundation'
ORDER BY created_at DESC;

-- If column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'memos' 
        AND column_name = 'sent_to_foundation_at'
    ) THEN
        ALTER TABLE memos 
        ADD COLUMN sent_to_foundation_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added sent_to_foundation_at column to memos table';
    ELSE
        RAISE NOTICE 'sent_to_foundation_at column already exists';
    END IF;
END $$;

-- Update existing memos with 'sent_to_foundation' status to have a timestamp
UPDATE memos 
SET sent_to_foundation_at = updated_at 
WHERE status = 'sent_to_foundation' AND sent_to_foundation_at IS NULL;

-- Verify the final state
SELECT 
    id, 
    memo_number, 
    status, 
    user_id, 
    created_at, 
    updated_at, 
    sent_to_foundation_at
FROM memos 
WHERE status = 'sent_to_foundation'
ORDER BY created_at DESC;
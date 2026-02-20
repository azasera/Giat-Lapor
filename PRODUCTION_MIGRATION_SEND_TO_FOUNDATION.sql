-- ============================================
-- PRODUCTION MIGRATION: Add Send to Foundation Feature
-- ============================================
-- Run this in Supabase SQL Editor for PRODUCTION database
-- Date: 2026-02-20
-- Description: Add sent_to_foundation_at column to track when memo was sent to foundation

-- Step 1: Check if column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memos' 
        AND column_name = 'sent_to_foundation_at'
    ) THEN
        -- Add the column
        ALTER TABLE memos 
        ADD COLUMN sent_to_foundation_at TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE '✅ Column sent_to_foundation_at added successfully';
    ELSE
        RAISE NOTICE '⚠️ Column sent_to_foundation_at already exists, skipping...';
    END IF;
END $$;

-- Step 2: Update existing memos with 'sent_to_foundation' status
UPDATE memos 
SET sent_to_foundation_at = updated_at 
WHERE status = 'sent_to_foundation' 
AND sent_to_foundation_at IS NULL;

-- Step 3: Add comment to document the column
COMMENT ON COLUMN memos.sent_to_foundation_at IS 'Timestamp when memo was sent to foundation';

-- Step 4: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name = 'sent_to_foundation_at' THEN '✅ Column exists'
        ELSE '❌ Column missing'
    END as status
FROM information_schema.columns 
WHERE table_name = 'memos' 
AND column_name = 'sent_to_foundation_at';

-- Step 5: Show sample data
SELECT 
    id,
    memo_number,
    status,
    sent_to_foundation_at,
    created_at,
    updated_at
FROM memos
WHERE status = 'sent_to_foundation'
ORDER BY created_at DESC
LIMIT 5;

-- Step 6: Count memos by status
SELECT 
    status,
    COUNT(*) as total,
    COUNT(sent_to_foundation_at) as with_timestamp
FROM memos
GROUP BY status
ORDER BY status;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- 1. Column sent_to_foundation_at should exist with type "timestamp with time zone"
-- 2. All memos with status 'sent_to_foundation' should have sent_to_foundation_at timestamp
-- 3. No errors should occur

-- ============================================
-- ROLLBACK (if needed):
-- ============================================
-- Uncomment and run this if you need to rollback:
/*
ALTER TABLE memos DROP COLUMN IF EXISTS sent_to_foundation_at;
UPDATE memos SET status = 'final' WHERE status = 'sent_to_foundation';
*/

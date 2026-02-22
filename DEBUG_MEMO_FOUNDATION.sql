-- ============================================
-- DEBUG: Check Memo Foundation Access
-- ============================================
-- Run this in Supabase SQL Editor to debug why foundation can't see memos

-- Step 1: Check all memos and their status
SELECT 
    id,
    memo_number,
    subject,
    status,
    user_id,
    sent_to_foundation_at,
    created_at,
    updated_at
FROM memos
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Count memos by status
SELECT 
    status,
    COUNT(*) as total
FROM memos
GROUP BY status
ORDER BY status;

-- Step 3: Check specifically sent_to_foundation memos
SELECT 
    id,
    memo_number,
    subject,
    status,
    user_id,
    sent_to_foundation_at,
    created_at
FROM memos
WHERE status = 'sent_to_foundation'
ORDER BY created_at DESC;

-- Step 4: Check if sent_to_foundation_at column exists and has data
SELECT 
    COUNT(*) as total_memos,
    COUNT(sent_to_foundation_at) as memos_with_timestamp,
    COUNT(CASE WHEN status = 'sent_to_foundation' THEN 1 END) as sent_to_foundation_count
FROM memos;

-- Step 5: Check user profiles and roles
SELECT 
    id,
    username,
    full_name,
    email,
    role
FROM profiles
ORDER BY created_at DESC;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- 1. Should see memos with status 'sent_to_foundation'
-- 2. Those memos should have sent_to_foundation_at timestamp
-- 3. Foundation users should have role = 'foundation'

-- ============================================
-- IF NO MEMOS WITH sent_to_foundation STATUS:
-- ============================================
-- The send button was clicked but status didn't update.
-- Check browser console for errors when clicking send button.

-- ============================================
-- TO MANUALLY SET A MEMO AS SENT (FOR TESTING):
-- ============================================
-- Uncomment and run this to manually mark a memo as sent:
/*
UPDATE memos 
SET 
    status = 'sent_to_foundation',
    sent_to_foundation_at = NOW(),
    updated_at = NOW()
WHERE id = 'YOUR_MEMO_ID_HERE';
*/

-- Fix reports table ID column to auto-generate UUID
-- Run this in Supabase SQL Editor

-- Check current schema
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';

-- Fix the ID column to auto-generate UUID
ALTER TABLE reports 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make sure id column allows NULL temporarily for the fix
ALTER TABLE reports 
ALTER COLUMN id DROP NOT NULL;

-- Update any existing NULL ids
UPDATE reports 
SET id = gen_random_uuid() 
WHERE id IS NULL;

-- Set back to NOT NULL
ALTER TABLE reports 
ALTER COLUMN id SET NOT NULL;

-- Verify the fix
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';

-- Test insert without id field
-- INSERT INTO reports (user_id, report_date, principal_name, school_name, period, status) 
-- VALUES ('test-user', '2025-01-01', 'Test Principal', 'Test School', 'January', 'draft');
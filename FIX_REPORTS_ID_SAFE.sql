-- Safe fix for reports table ID column (Primary Key)
-- Run this in Supabase SQL Editor

-- Check current schema first
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';

-- Simply set the default value for ID column (safe for primary key)
ALTER TABLE reports 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the fix
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reports' AND column_name = 'id';

-- Test that new inserts work (optional)
-- This should now work without specifying id:
-- INSERT INTO reports (user_id, report_date, principal_name, school_name, period, status) 
-- VALUES ('test-user-id', '2025-01-01', 'Test Principal', 'Test School', 'January', 'draft');
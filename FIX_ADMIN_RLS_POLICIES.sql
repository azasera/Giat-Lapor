-- =====================================================
-- DIAGNOSTIC: Check Admin Access to Data
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose why admin can't see data

-- 1. Check current user's role
SELECT id, username, full_name, role, email
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
WHERE auth.users.id = auth.uid();

-- 2. Check if data exists in tables
SELECT 'RAB Data' as table_name, COUNT(*) as total_records FROM rab_data
UNION ALL
SELECT 'Memos', COUNT(*) FROM memos
UNION ALL
SELECT 'Tahfidz Supervisions', COUNT(*) FROM tahfidz_supervisions
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports;

-- 3. Check RLS policies for rab_data table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'rab_data';

-- 4. Check RLS policies for memos table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'memos';

-- 5. Check RLS policies for tahfidz_supervisions table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tahfidz_supervisions';

-- 6. Check RLS policies for reports table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'reports';

-- 7. Test if admin can SELECT from rab_data
SELECT id, institution_name, period, year, status, user_id
FROM rab_data
LIMIT 5;

-- 8. Test if admin can SELECT from memos
SELECT id, memo_number, subject, status, user_id
FROM memos
LIMIT 5;

-- 9. Test if admin can SELECT from tahfidz_supervisions
SELECT id, teacher_name, supervision_date, status, user_id
FROM tahfidz_supervisions
LIMIT 5;

-- =====================================================
-- SOLUTION: Fix RLS Policies for Admin Access
-- =====================================================
-- If the above queries show RLS is blocking admin, run these:

-- Fix RAB Data RLS
DROP POLICY IF EXISTS "Admin can view all RAB data" ON rab_data;
CREATE POLICY "Admin can view all RAB data"
ON rab_data FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Fix Memos RLS
DROP POLICY IF EXISTS "Admin can view all memos" ON memos;
CREATE POLICY "Admin can view all memos"
ON memos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Fix Tahfidz Supervisions RLS
DROP POLICY IF EXISTS "Admin can view all supervisions" ON tahfidz_supervisions;
CREATE POLICY "Admin can view all supervisions"
ON tahfidz_supervisions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Fix Reports RLS
DROP POLICY IF EXISTS "Admin can view all reports" ON reports;
CREATE POLICY "Admin can view all reports"
ON reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Fix Realizations RLS
DROP POLICY IF EXISTS "Admin can view all realizations" ON rab_realizations;
CREATE POLICY "Admin can view all realizations"
ON rab_realizations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- VERIFICATION: Test Admin Access After Fix
-- =====================================================
-- Run these queries again to verify admin can now see data

SELECT 'RAB Data' as table_name, COUNT(*) as visible_records FROM rab_data
UNION ALL
SELECT 'Memos', COUNT(*) FROM memos
UNION ALL
SELECT 'Tahfidz Supervisions', COUNT(*) FROM tahfidz_supervisions
UNION ALL
SELECT 'Reports', COUNT(*) FROM reports
UNION ALL
SELECT 'Realizations', COUNT(*) FROM rab_realizations;

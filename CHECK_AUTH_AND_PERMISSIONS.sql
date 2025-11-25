-- ============================================
-- CEK AUTHENTICATION & PERMISSIONS
-- ============================================

-- 1. Cek semua tabel yang punya RLS enabled
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- 2. Cek permissions untuk anon role
SELECT 
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'anon'
AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 3. Cek permissions untuk authenticated role
SELECT 
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = 'authenticated'
AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 4. Cek policy untuk tabel tahfidz_annual_schedules
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- ============================================
-- HASIL YANG DIHARAPKAN:
-- 1. tahfidz_annual_schedules: rls_enabled = true
-- 2. anon & authenticated punya SELECT, INSERT, UPDATE, DELETE
-- 3. Policy allow_all_operations dengan true/true
-- ============================================

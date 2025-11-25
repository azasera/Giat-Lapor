-- ============================================
-- VERIFY RLS STATUS LENGKAP
-- ============================================

-- 1. Cek RLS status
SELECT 
  schemaname,
  tablename, 
  rowsecurity as rls_enabled,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- 2. Cek policies (harusnya kosong)
SELECT * FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- 3. Cek table privileges
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'tahfidz_annual_schedules'
ORDER BY grantee, privilege_type;

-- 4. Cek apakah ada FORCE ROW LEVEL SECURITY
SELECT 
  relname,
  relrowsecurity,
  relforcerowsecurity
FROM pg_class
WHERE relname = 'tahfidz_annual_schedules';

-- relrowsecurity = false (RLS disabled)
-- relforcerowsecurity = false (FORCE RLS disabled)

-- ============================================
-- Jika relforcerowsecurity = true, jalankan:
-- ============================================

ALTER TABLE public.tahfidz_annual_schedules NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

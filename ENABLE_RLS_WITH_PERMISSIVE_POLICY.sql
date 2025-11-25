-- ============================================
-- ENABLE RLS DENGAN POLICY SUPER PERMISIF
-- (Kadang disable RLS malah bikin masalah di API)
-- ============================================

-- 1. Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- 2. Buat policy yang allow SEMUA tanpa check apapun
CREATE POLICY "allow_all_operations"
ON public.tahfidz_annual_schedules
FOR ALL
USING (true)
WITH CHECK (true);

-- 3. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- 4. Cek policy
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- ============================================
-- HASIL YANG DIHARAPKAN:
-- rls_enabled = true
-- policy: allow_all_operations dengan USING (true) dan WITH CHECK (true)
-- ============================================

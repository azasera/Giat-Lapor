-- ============================================
-- SOLUSI FINAL: DISABLE RLS SEPENUHNYA
-- ============================================

-- 1. Hapus semua policies
DROP POLICY IF EXISTS "allow_all" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "allow_all_operations" ON public.tahfidz_annual_schedules;

-- 2. Disable RLS
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

-- 3. Grant permissions eksplisit
GRANT ALL ON public.tahfidz_annual_schedules TO anon;
GRANT ALL ON public.tahfidz_annual_schedules TO authenticated;
GRANT ALL ON public.tahfidz_annual_schedules TO service_role;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 4. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- Harusnya: rls_enabled = false

SELECT 
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- Harusnya: total_policies = 0

-- ============================================
-- SETELAH JALANKAN SQL INI:
-- 1. RESTART Supabase project
-- 2. Tunggu 2-3 menit
-- 3. Hard refresh browser
-- 4. Coba simpan jadwal
-- ============================================

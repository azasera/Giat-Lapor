-- ============================================
-- EMERGENCY: DISABLE RLS COMPLETELY
-- ============================================

-- 1. Disable RLS
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

-- 2. Verifikasi RLS sudah disabled
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- Harusnya menampilkan: rls_enabled = false

-- ============================================
-- Sekarang coba simpan dari aplikasi web!
-- ============================================

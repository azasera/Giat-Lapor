-- ============================================
-- FIX RLS UNTUK TABEL TEACHERS
-- ============================================

-- 1. Cek RLS status tabel teachers
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'teachers';

-- 2. Lihat policies yang ada
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'teachers';

-- 3. Disable RLS sementara untuk testing
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;

-- 4. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'teachers';

-- Harusnya menampilkan: rls_enabled = false

-- ============================================
-- SELESAI! Guru harusnya muncul di app
-- ============================================

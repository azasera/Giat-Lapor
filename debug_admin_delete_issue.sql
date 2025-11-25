-- ============================================
-- DEBUG: Admin Tidak Bisa Menghapus
-- ============================================

-- 1. CEK RLS POLICIES untuk DELETE
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('reports', 'rab_data', 'rab_realizations')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- 2. CEK apakah RLS aktif
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('reports', 'rab_data', 'rab_realizations');

-- 3. CEK role admin
SELECT 
  u.id,
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Role Admin Benar'
    ELSE '❌ Role Bukan Admin: ' || p.role
  END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin' OR u.email LIKE '%admin%';

-- 4. TEST DELETE sebagai admin
-- Uncomment untuk test (HATI-HATI!)
-- DELETE FROM reports WHERE id = 'TEST_REPORT_ID';

-- ============================================
-- MASALAH UMUM & SOLUSI
-- ============================================

-- MASALAH 1: Policy DELETE hanya untuk user_id = auth.uid()
-- Ini berarti admin TIDAK bisa hapus data user lain

-- CEK policy yang ada:
SELECT 
  policyname,
  qual
FROM pg_policies
WHERE tablename = 'reports' AND cmd = 'DELETE';

-- SOLUSI 1: Tambah policy khusus untuk admin
-- Uncomment jika policy admin belum ada:

-- CREATE POLICY "Admin can delete all reports."
--   ON public.reports FOR DELETE
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));

-- CREATE POLICY "Admin can delete all rab_data."
--   ON public.rab_data FOR DELETE
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));

-- CREATE POLICY "Admin can delete all rab_realizations."
--   ON public.rab_realizations FOR DELETE
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));

-- ============================================
-- VERIFIKASI SETELAH FIX
-- ============================================

-- Setelah menambah policy admin, cek lagi:
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('reports', 'rab_data', 'rab_realizations')
  AND cmd = 'DELETE'
  AND policyname LIKE '%admin%';

-- Test apakah admin bisa query semua data
SELECT 
  COUNT(*) as total_reports,
  'Admin seharusnya bisa lihat semua' as catatan
FROM reports;

-- ============================================
-- EMERGENCY FIX: Disable RLS (TIDAK DIREKOMENDASIKAN)
-- ============================================

-- Jika benar-benar urgent, bisa disable RLS sementara
-- HATI-HATI: Ini membuat semua user bisa hapus semua data!

-- ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rab_data DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rab_realizations DISABLE ROW LEVEL SECURITY;

-- Setelah fix policy, enable lagi:
-- ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rab_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.rab_realizations ENABLE ROW LEVEL SECURITY;

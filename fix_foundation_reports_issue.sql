-- ============================================
-- FIX: Laporan Tidak Muncul di Foundation
-- ============================================
-- Jalankan query ini di Supabase SQL Editor untuk troubleshooting

-- ============================================
-- STEP 1: DIAGNOSA MASALAH
-- ============================================

-- 1.1 Cek apakah ada laporan yang sudah dikirim (submitted)
SELECT 
  'Total laporan submitted/approved' as info,
  COUNT(*) as jumlah
FROM reports
WHERE status IN ('submitted', 'approved');

-- 1.2 Cek detail laporan yang sudah dikirim
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.school_name,
  r.status,
  r.submitted_at,
  r.created_at
FROM reports r
JOIN auth.users u ON r.user_id = u.id
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.created_at DESC;

-- 1.3 Cek apakah user foundation memiliki role yang benar
SELECT 
  u.id,
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'foundation' THEN '✅ Role Benar'
    ELSE '❌ Role Salah: ' || COALESCE(p.role, 'NULL')
  END as status_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%foundation%' 
   OR u.email LIKE '%yayasan%'
   OR p.role = 'foundation';

-- 1.4 Cek RLS Policy untuk Foundation
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'reports'
  AND policyname LIKE '%foundation%';

-- ============================================
-- STEP 2: KEMUNGKINAN MASALAH & SOLUSI
-- ============================================

-- MASALAH A: Laporan masih berstatus 'draft'
-- Cek laporan dengan status draft
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.status,
  '❌ Status masih draft - tidak terlihat di Foundation' as masalah
FROM reports r
JOIN auth.users u ON r.user_id = u.id
WHERE r.status = 'draft'
ORDER BY r.created_at DESC;

-- SOLUSI A: Update status menjadi 'submitted'
-- Uncomment dan ganti ID jika perlu
-- UPDATE reports 
-- SET 
--   status = 'submitted',
--   submitted_at = NOW(),
--   updated_at = NOW()
-- WHERE id = 'GANTI_DENGAN_ID_LAPORAN';

-- Atau update semua draft yang sudah lama (lebih dari 1 hari)
-- UPDATE reports 
-- SET 
--   status = 'submitted',
--   submitted_at = NOW(),
--   updated_at = NOW()
-- WHERE status = 'draft' 
--   AND created_at < NOW() - INTERVAL '1 day';

-- ============================================

-- MASALAH B: User foundation tidak memiliki role yang benar
-- Cek user yang seharusnya foundation tapi rolenya salah
SELECT 
  u.id,
  u.email,
  p.role,
  '❌ Role harus diubah menjadi foundation' as masalah
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE (u.email LIKE '%foundation%' OR u.email LIKE '%yayasan%')
  AND (p.role IS NULL OR p.role != 'foundation');

-- SOLUSI B: Update role menjadi 'foundation'
-- Uncomment dan ganti email jika perlu
-- UPDATE profiles 
-- SET role = 'foundation', updated_at = NOW()
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'email_foundation@example.com'
-- );

-- ============================================

-- MASALAH C: RLS Policy tidak ada atau salah
-- Cek apakah policy foundation ada
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'reports' 
        AND policyname = 'Foundation can view all reports.'
    ) THEN '✅ Policy Foundation sudah ada'
    ELSE '❌ Policy Foundation TIDAK ADA - Perlu dibuat'
  END as status_policy;

-- SOLUSI C: Buat policy jika belum ada
-- Uncomment jika policy tidak ada
-- CREATE POLICY "Foundation can view all reports."
--   ON public.reports FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'foundation'
--   ));

-- ============================================

-- MASALAH D: Admin role tidak bisa lihat semua
-- Cek apakah ada policy untuk admin
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'reports' 
        AND policyname LIKE '%admin%'
    ) THEN '✅ Policy Admin sudah ada'
    ELSE '⚠️ Policy Admin belum ada - Admin harus dibuat'
  END as status_policy_admin;

-- SOLUSI D: Buat policy untuk admin jika belum ada
-- Uncomment jika policy tidak ada
-- CREATE POLICY "Admin can view all reports."
--   ON public.reports FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));

-- ============================================
-- STEP 3: QUICK FIX - KIRIM SEMUA DRAFT
-- ============================================

-- Jika Anda yakin semua draft sudah siap dikirim:
-- Uncomment untuk mengirim semua draft

-- UPDATE reports 
-- SET 
--   status = 'submitted',
--   submitted_at = NOW(),
--   updated_at = NOW()
-- WHERE status = 'draft';

-- ============================================
-- STEP 4: VERIFIKASI SETELAH FIX
-- ============================================

-- 4.1 Cek jumlah laporan per status
SELECT 
  status,
  COUNT(*) as jumlah,
  CASE 
    WHEN status IN ('submitted', 'approved') THEN '✅ Terlihat di Foundation'
    ELSE '❌ Tidak terlihat di Foundation'
  END as visibility
FROM reports
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'submitted' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'draft' THEN 3
    ELSE 4
  END;

-- 4.2 Cek laporan yang seharusnya terlihat foundation
SELECT 
  r.id,
  u.email as pembuat,
  r.principal_name,
  r.school_name,
  r.status,
  r.submitted_at,
  '✅ Laporan ini SEHARUSNYA terlihat di Foundation' as status_visibility
FROM reports r
JOIN auth.users u ON r.user_id = u.id
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.submitted_at DESC NULLS LAST, r.created_at DESC;

-- 4.3 Test query sebagai foundation
-- Ini adalah query yang digunakan aplikasi untuk foundation
SELECT 
  r.id,
  r.principal_name,
  r.school_name,
  r.status,
  r.submitted_at
FROM reports r
WHERE r.status IN ('submitted', 'approved')
ORDER BY r.report_date DESC;

-- ============================================
-- STEP 5: EMERGENCY FIX - RECREATE POLICIES
-- ============================================

-- Jika semua cara di atas tidak berhasil, recreate semua policies
-- HATI-HATI: Ini akan menghapus dan membuat ulang semua policies

-- Uncomment jika benar-benar diperlukan:

-- -- Drop existing policies
-- DROP POLICY IF EXISTS "Users can view their own reports." ON public.reports;
-- DROP POLICY IF EXISTS "Users can insert their own reports." ON public.reports;
-- DROP POLICY IF EXISTS "Users can update their own reports." ON public.reports;
-- DROP POLICY IF EXISTS "Users can delete their own reports." ON public.reports;
-- DROP POLICY IF EXISTS "Foundation can view all reports." ON public.reports;
-- DROP POLICY IF EXISTS "Admin can view all reports." ON public.reports;

-- -- Recreate policies
-- CREATE POLICY "Users can view their own reports."
--   ON public.reports FOR SELECT
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own reports."
--   ON public.reports FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own reports."
--   ON public.reports FOR UPDATE
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can delete their own reports."
--   ON public.reports FOR DELETE
--   USING (auth.uid() = user_id);

-- CREATE POLICY "Foundation can view all reports."
--   ON public.reports FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'foundation'
--   ));

-- CREATE POLICY "Admin can view all reports."
--   ON public.reports FOR SELECT
--   USING (EXISTS (
--     SELECT 1 FROM public.profiles 
--     WHERE id = auth.uid() AND role = 'admin'
--   ));

-- -- Ensure RLS is enabled
-- ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CATATAN PENTING
-- ============================================
-- 1. Setelah mengubah role, user HARUS logout dan login lagi
-- 2. Setelah mengubah status laporan, refresh halaman
-- 3. Cek browser console untuk error messages
-- 4. Pastikan Supabase credentials benar di aplikasi
-- ============================================

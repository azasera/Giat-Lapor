-- ============================================
-- FIX: Admin Tidak Bisa Menghapus Data
-- ============================================
-- Jalankan script ini di Supabase SQL Editor

-- ============================================
-- STEP 1: Tambah Policy DELETE untuk Admin
-- ============================================

-- 1.1 Policy untuk REPORTS
CREATE POLICY "Admin can delete all reports."
  ON public.reports FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.2 Policy untuk RAB_DATA
CREATE POLICY "Admin can delete all rab_data."
  ON public.rab_data FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.3 Policy untuk RAB_REALIZATIONS
CREATE POLICY "Admin can delete all rab_realizations."
  ON public.rab_realizations FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.4 Policy untuk EXPENSE_ITEMS (cascade dari RAB)
CREATE POLICY "Admin can delete all expense_items."
  ON public.expense_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.5 Policy untuk REALIZATION_ITEMS (cascade dari Realisasi)
CREATE POLICY "Admin can delete all realization_items."
  ON public.realization_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.6 Policy untuk ACTIVITIES (cascade dari Reports)
CREATE POLICY "Admin can delete all activities."
  ON public.activities FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 1.7 Policy untuk ACHIEVEMENTS (cascade dari Reports)
CREATE POLICY "Admin can delete all achievements."
  ON public.achievements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- STEP 2: Tambah Policy UPDATE untuk Admin
-- ============================================
-- Admin juga perlu bisa update semua data

-- 2.1 Policy UPDATE untuk REPORTS
CREATE POLICY "Admin can update all reports."
  ON public.reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2.2 Policy UPDATE untuk RAB_DATA
CREATE POLICY "Admin can update all rab_data."
  ON public.rab_data FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2.3 Policy UPDATE untuk RAB_REALIZATIONS
CREATE POLICY "Admin can update all rab_realizations."
  ON public.rab_realizations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- STEP 3: Verifikasi Policy Sudah Dibuat
-- ============================================

-- Cek semua policy admin yang baru dibuat
SELECT 
  tablename,
  policyname,
  cmd,
  '✅ Policy Admin Berhasil Dibuat' as status
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, cmd;

-- ============================================
-- STEP 4: Test Delete (Optional)
-- ============================================

-- Setelah menjalankan script di atas:
-- 1. Logout dari aplikasi
-- 2. Login lagi sebagai admin
-- 3. Coba hapus data
-- 4. Seharusnya berhasil!

-- ============================================
-- ROLLBACK (Jika Ada Masalah)
-- ============================================

-- Jika ada error atau ingin rollback, uncomment ini:

-- DROP POLICY IF EXISTS "Admin can delete all reports." ON public.reports;
-- DROP POLICY IF EXISTS "Admin can delete all rab_data." ON public.rab_data;
-- DROP POLICY IF EXISTS "Admin can delete all rab_realizations." ON public.rab_realizations;
-- DROP POLICY IF EXISTS "Admin can delete all expense_items." ON public.expense_items;
-- DROP POLICY IF EXISTS "Admin can delete all realization_items." ON public.realization_items;
-- DROP POLICY IF EXISTS "Admin can delete all activities." ON public.activities;
-- DROP POLICY IF EXISTS "Admin can delete all achievements." ON public.achievements;
-- DROP POLICY IF EXISTS "Admin can update all reports." ON public.reports;
-- DROP POLICY IF EXISTS "Admin can update all rab_data." ON public.rab_data;
-- DROP POLICY IF EXISTS "Admin can update all rab_realizations." ON public.rab_realizations;

-- ============================================
-- CATATAN PENTING
-- ============================================

-- 1. Setelah menjalankan script ini, admin HARUS logout & login lagi
-- 2. Policy ini memberikan admin full access untuk DELETE & UPDATE
-- 3. Pastikan hanya user terpercaya yang punya role 'admin'
-- 4. Backup data sebelum admin menghapus data penting
-- 5. Policy ini aman karena cek role di database level

-- ============================================
-- ALTERNATIVE: Policy dengan OR Condition
-- ============================================

-- Jika ingin menggabungkan policy user dan admin dalam satu policy:

-- DROP POLICY IF EXISTS "Users can delete their own reports." ON public.reports;
-- 
-- CREATE POLICY "Users and Admin can delete reports."
--   ON public.reports FOR DELETE
--   USING (
--     auth.uid() = user_id OR
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE id = auth.uid() AND role = 'admin'
--     )
--   );

-- Tapi lebih baik pisah policy untuk clarity dan maintainability

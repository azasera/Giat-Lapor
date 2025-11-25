-- ============================================
-- FIX RLS: Policy Tanpa Auth Check
-- ============================================

-- Hapus semua policy lama
DROP POLICY IF EXISTS "All authenticated can view annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Users can update their own annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Users can delete their own annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Enable update for users based on created_by" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "allow_all_for_authenticated" ON public.tahfidz_annual_schedules;

-- Buat policy baru yang tidak check auth.uid()
-- SELECT: Semua authenticated user bisa lihat
CREATE POLICY "select_for_authenticated"
ON public.tahfidz_annual_schedules
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Semua authenticated user bisa insert
-- TIDAK check created_by = auth.uid() karena bisa null di SQL Editor
CREATE POLICY "insert_for_authenticated"
ON public.tahfidz_annual_schedules
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Semua authenticated user bisa update
CREATE POLICY "update_for_authenticated"
ON public.tahfidz_annual_schedules
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Semua authenticated user bisa delete
CREATE POLICY "delete_for_authenticated"
ON public.tahfidz_annual_schedules
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- SELESAI! Sekarang coba simpan dari aplikasi
-- ============================================

-- ============================================
-- FIX RLS POLICY UNTUK JADWAL TAHUNAN
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Hapus semua policy yang ada
DROP POLICY IF EXISTS "All authenticated can view annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Users can update their own annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Users can delete their own annual schedules" ON public.tahfidz_annual_schedules;

-- 2. Buat policy baru yang lebih permisif

-- SELECT: Semua authenticated user bisa lihat
CREATE POLICY "Enable read for authenticated users"
ON public.tahfidz_annual_schedules FOR SELECT
TO authenticated
USING (true);

-- INSERT: Semua authenticated user bisa insert dengan created_by = auth.uid()
CREATE POLICY "Enable insert for authenticated users"
ON public.tahfidz_annual_schedules FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- UPDATE: User bisa update data mereka sendiri
CREATE POLICY "Enable update for users based on created_by"
ON public.tahfidz_annual_schedules FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- DELETE: User bisa delete data mereka sendiri
CREATE POLICY "Enable delete for users based on created_by"
ON public.tahfidz_annual_schedules FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================
-- SELESAI! RLS Policy sudah diperbaiki
-- ============================================

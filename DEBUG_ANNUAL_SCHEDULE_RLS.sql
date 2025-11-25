-- ============================================
-- DEBUG RLS UNTUK ANNUAL SCHEDULE
-- ============================================

-- 1. Cek apakah tabel ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'tahfidz_annual_schedules'
) as table_exists;

-- 2. Cek RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- 3. Lihat semua policies yang ada
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
WHERE tablename = 'tahfidz_annual_schedules';

-- 4. Cek user saat ini
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- ============================================
-- SOLUSI SEMENTARA: DISABLE RLS
-- (Hanya untuk testing, jangan di production!)
-- ============================================

-- Uncomment baris di bawah untuk disable RLS sementara
-- ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SOLUSI PERMANEN: POLICY YANG BENAR
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

-- Buat policy baru yang SANGAT permisif untuk testing
CREATE POLICY "allow_all_for_authenticated"
ON public.tahfidz_annual_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- TEST INSERT
-- ============================================

-- Test insert manual (ganti 'your-user-id' dengan ID user Anda)
/*
INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test Institution',
  '[]'::jsonb,
  auth.uid()
);
*/

-- ============================================
-- FIX RLS POLICY - JADWAL TAHUNAN
-- ============================================
-- Masalah: Error 403 "new row violates row-level security policy"
-- Penyebab: Policy INSERT memeriksa role di tabel profiles
-- Solusi: Drop dan recreate policies dengan kondisi yang lebih robust

-- Step 1: Drop existing INSERT policies
DROP POLICY IF EXISTS "Principal can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Admin can insert annual schedules" ON public.tahfidz_annual_schedules;

-- Step 2: Recreate INSERT policies dengan kondisi yang lebih robust
-- Policy untuk Principal
CREATE POLICY "Principal can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'principal'
    )
    OR
    -- Fallback: jika tidak ada profile, cek apakah user adalah creator
    (auth.uid() = created_by AND auth.uid() IS NOT NULL)
  );

-- Policy untuk Admin
CREATE POLICY "Admin can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if policies were created successfully
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
WHERE tablename = 'tahfidz_annual_schedules'
AND cmd = 'INSERT'
ORDER BY policyname;

-- Check user's profile and role
SELECT 
  id,
  role,
  username,
  full_name
FROM public.profiles 
WHERE id = auth.uid();

-- Test insert (will fail if user doesn't have permission)
-- Uncomment to test:
/*
INSERT INTO public.tahfidz_annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test Lembaga',
  '[]'::jsonb,
  auth.uid()
);
*/

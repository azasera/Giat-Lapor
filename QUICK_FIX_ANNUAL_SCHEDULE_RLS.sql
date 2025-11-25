-- ============================================
-- QUICK FIX - JADWAL TAHUNAN RLS
-- ============================================
-- Solusi cepat untuk memperbaiki RLS policy
-- Jalankan script ini di Supabase SQL Editor

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Principal can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Admin can insert annual schedules" ON public.tahfidz_annual_schedules;

-- Create single unified INSERT policy
CREATE POLICY "Authorized users can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('principal', 'admin')
    )
  );

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'tahfidz_annual_schedules'
AND cmd = 'INSERT';

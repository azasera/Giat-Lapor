-- ============================================
-- FIX: RLS Policy untuk tahfidz_annual_schedules
-- ============================================
-- Error 403: Forbidden saat insert
-- Solusi: Perbaiki INSERT policy
-- ============================================

-- Drop policy lama
DROP POLICY IF EXISTS "Principal can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Users can insert annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert annual schedules" ON public.tahfidz_annual_schedules;

-- Buat policy baru yang lebih permisif
CREATE POLICY "Authenticated users can insert annual schedules"
ON public.tahfidz_annual_schedules
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Juga perbaiki UPDATE policy
DROP POLICY IF EXISTS "Users can update their own annual schedules" ON public.tahfidz_annual_schedules;
DROP POLICY IF EXISTS "Principal can update annual schedules" ON public.tahfidz_annual_schedules;

CREATE POLICY "Users can update their own annual schedules"
ON public.tahfidz_annual_schedules
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admin can update all annual schedules"
ON public.tahfidz_annual_schedules
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Verifikasi
SELECT 
    'SUCCESS! Policies updated' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'tahfidz_annual_schedules'
ORDER BY cmd, policyname;

-- ============================================
-- DONE! Sekarang bisa insert dan update
-- ============================================

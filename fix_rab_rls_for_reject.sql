-- ============================================
-- FIX: RLS Policy untuk Reject RAB
-- ============================================
-- Error: The result contains 0 rows
-- Penyebab: RLS policy tidak mengizinkan foundation UPDATE RAB
-- ============================================

-- 1. Cek policy yang ada
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
WHERE tablename = 'rab_data'
ORDER BY cmd, policyname;

-- 2. Drop policy lama yang mungkin konflik (jika ada)
DROP POLICY IF EXISTS "Foundation can update RAB for review" ON public.rab_data;
DROP POLICY IF EXISTS "Admin can update all RAB" ON public.rab_data;

-- 3. Buat policy baru untuk Foundation UPDATE
CREATE POLICY "Foundation can update RAB for review"
ON public.rab_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
    AND status = 'submitted'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
);

-- 4. Buat policy untuk Admin UPDATE (full access)
CREATE POLICY "Admin can update all RAB"
ON public.rab_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 5. Verifikasi policy baru
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check::text
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'rab_data' 
AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- DONE! Policy sudah diperbaiki
-- ============================================
-- Foundation sekarang bisa UPDATE RAB dengan status 'submitted'
-- Admin bisa UPDATE semua RAB
-- ============================================

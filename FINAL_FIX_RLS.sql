-- ============================================
-- FINAL FIX: RLS Policy untuk Reject RAB
-- ============================================
-- Error: new row violates row-level security policy
-- Solusi: Perbaiki WITH CHECK clause
-- ============================================

-- 1. Drop semua policy UPDATE yang ada
DROP POLICY IF EXISTS "Foundation can update RAB for review" ON public.rab_data;
DROP POLICY IF EXISTS "Admin can update all RAB" ON public.rab_data;
DROP POLICY IF EXISTS "Users can update their own RAB" ON public.rab_data;
DROP POLICY IF EXISTS "Principal can update their own RAB" ON public.rab_data;

-- 2. Policy untuk Principal UPDATE RAB mereka sendiri (draft/rejected)
CREATE POLICY "Principal can update their own RAB"
ON public.rab_data
FOR UPDATE
USING (
    user_id = auth.uid() 
    AND (status = 'draft' OR status = 'rejected')
)
WITH CHECK (
    user_id = auth.uid()
);

-- 3. Policy untuk Foundation UPDATE RAB (approve/reject)
CREATE POLICY "Foundation can update RAB for review"
ON public.rab_data
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
);

-- 4. Policy untuk Admin UPDATE semua RAB
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

-- 5. Verifikasi semua policy UPDATE
SELECT 
    'SUCCESS! All UPDATE policies created' as status,
    policyname,
    cmd,
    SUBSTRING(qual::text, 1, 50) as using_clause,
    SUBSTRING(with_check::text, 1, 50) as with_check_clause
FROM pg_policies 
WHERE tablename = 'rab_data' 
AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- DONE! Policy sudah diperbaiki
-- ============================================
-- Foundation sekarang bisa UPDATE RAB tanpa batasan status di WITH CHECK
-- Ini memungkinkan perubahan status dari 'submitted' ke 'rejected' atau 'approved'
-- ============================================

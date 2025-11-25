-- ============================================
-- QUICK FIX: RLS Policy untuk Reject RAB
-- ============================================
-- Copy-paste dan Run di Supabase SQL Editor
-- ============================================

-- Drop policy lama (jika ada)
DROP POLICY IF EXISTS "Foundation can update RAB for review" ON public.rab_data;
DROP POLICY IF EXISTS "Admin can update all RAB" ON public.rab_data;

-- Policy untuk Foundation UPDATE RAB
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

-- Policy untuk Admin UPDATE semua RAB
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

-- Verifikasi
SELECT 
    'SUCCESS! RLS policies updated' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'rab_data' 
AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- DONE! Refresh browser dan test reject lagi
-- ============================================

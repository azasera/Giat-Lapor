-- ============================================
-- DEBUG & FIX: Complete RLS Policy Reset
-- ============================================
-- Masalah: Masih ada policy yang konflik
-- Solusi: Reset semua policy dan buat ulang dari awal
-- ============================================

-- STEP 1: Lihat semua policy yang ada untuk rab_data
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'rab_data'
ORDER BY cmd, policyname;

-- STEP 2: Drop SEMUA policy untuk rab_data (reset total)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'rab_data'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.rab_data', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- STEP 3: Buat policy baru yang benar

-- SELECT Policies
CREATE POLICY "Users can view their own RAB"
ON public.rab_data
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Foundation can view all RAB"
ON public.rab_data
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'foundation'
    )
);

CREATE POLICY "Admin can view all RAB"
ON public.rab_data
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- INSERT Policies
CREATE POLICY "Users can insert their own RAB"
ON public.rab_data
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE Policies
CREATE POLICY "Principal can update their own RAB"
ON public.rab_data
FOR UPDATE
USING (
    user_id = auth.uid() 
    AND (status = 'draft' OR status = 'rejected' OR status IS NULL)
)
WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "Foundation can update any RAB"
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

-- DELETE Policies
CREATE POLICY "Users can delete their own RAB"
ON public.rab_data
FOR DELETE
USING (
    user_id = auth.uid() 
    AND (status = 'draft' OR status = 'rejected' OR status IS NULL)
);

CREATE POLICY "Admin can delete all RAB"
ON public.rab_data
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- STEP 4: Verifikasi semua policy baru
SELECT 
    'SUCCESS! All policies recreated' as status,
    cmd,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'rab_data'
GROUP BY cmd
ORDER BY cmd;

-- STEP 5: Detail semua policy
SELECT 
    policyname,
    cmd,
    SUBSTRING(qual::text, 1, 80) as using_clause,
    SUBSTRING(with_check::text, 1, 80) as with_check_clause
FROM pg_policies 
WHERE tablename = 'rab_data'
ORDER BY cmd, policyname;

-- ============================================
-- DONE! Semua policy sudah di-reset dan dibuat ulang
-- ============================================

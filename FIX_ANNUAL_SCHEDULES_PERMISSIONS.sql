-- ============================================
-- FIX PERMISSIONS UNTUK TABEL annual_schedules
-- ============================================

-- 1. Pastikan RLS disabled
ALTER TABLE public.annual_schedules DISABLE ROW LEVEL SECURITY;

-- 2. Hapus semua policies (jika ada)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'annual_schedules') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.annual_schedules';
    END LOOP;
END $$;

-- 3. Grant permissions
GRANT ALL ON public.annual_schedules TO anon;
GRANT ALL ON public.annual_schedules TO authenticated;
GRANT ALL ON public.annual_schedules TO service_role;

-- 4. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'annual_schedules';

-- 5. Test insert
INSERT INTO public.annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test After Fix',
  '[]'::jsonb,
  'e4b197c3-cf85-4ee6-82e5-7dfd805d97b9'::uuid
)
RETURNING *;

-- 6. Hapus test data
DELETE FROM public.annual_schedules 
WHERE institution_name = 'Test After Fix';

-- ============================================
-- SELESAI! Sekarang restart project
-- ============================================

-- ============================================
-- FORCE DISABLE RLS - PALING AGRESIF
-- ============================================

-- 1. Hapus SEMUA policies di tabel tahfidz_annual_schedules
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'tahfidz_annual_schedules') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.tahfidz_annual_schedules';
    END LOOP;
END $$;

-- 2. FORCE disable RLS
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_annual_schedules FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_annual_schedules NO FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_annual_schedules DISABLE ROW LEVEL SECURITY;

-- 3. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- 4. Cek policies (harusnya kosong)
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- ============================================
-- JIKA MASIH ERROR, JALANKAN INI:
-- ============================================

-- Grant permissions eksplisit
GRANT ALL ON public.tahfidz_annual_schedules TO authenticated;
GRANT ALL ON public.tahfidz_annual_schedules TO anon;
GRANT ALL ON public.tahfidz_annual_schedules TO service_role;

-- ============================================
-- HASIL YANG DIHARAPKAN:
-- rls_enabled = false
-- total_policies = 0
-- ============================================

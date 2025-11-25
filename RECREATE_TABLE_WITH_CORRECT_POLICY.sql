-- ============================================
-- RECREATE TABLE DARI AWAL
-- ============================================

-- 1. Backup data (jika ada)
CREATE TEMP TABLE temp_backup AS 
SELECT * FROM public.tahfidz_annual_schedules;

-- 2. Drop tabel lama
DROP TABLE IF EXISTS public.tahfidz_annual_schedules CASCADE;

-- 3. Buat tabel baru
CREATE TABLE public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- 5. Buat policy yang benar
CREATE POLICY "allow_all"
ON public.tahfidz_annual_schedules
AS PERMISSIVE
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 6. Grant permissions
GRANT ALL ON public.tahfidz_annual_schedules TO anon;
GRANT ALL ON public.tahfidz_annual_schedules TO authenticated;
GRANT ALL ON public.tahfidz_annual_schedules TO service_role;

-- 7. Index
CREATE INDEX idx_tahfidz_annual_schedules_year 
ON public.tahfidz_annual_schedules(year);

CREATE INDEX idx_tahfidz_annual_schedules_created_by 
ON public.tahfidz_annual_schedules(created_by);

-- 8. Restore data (jika ada)
INSERT INTO public.tahfidz_annual_schedules
SELECT * FROM temp_backup;

-- 9. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

SELECT 
  policyname,
  cmd,
  roles,
  qual::text,
  with_check::text
FROM pg_policies
WHERE tablename = 'tahfidz_annual_schedules';

-- ============================================
-- SELESAI! Tabel baru dengan policy yang benar
-- ============================================

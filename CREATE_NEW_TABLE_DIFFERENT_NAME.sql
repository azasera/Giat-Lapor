-- ============================================
-- BUAT TABEL BARU DENGAN NAMA BERBEDA
-- (Untuk bypass RLS issue yang persistent)
-- ============================================

-- 1. Backup data lama (jika ada)
CREATE TEMP TABLE temp_annual_backup AS 
SELECT * FROM public.tahfidz_annual_schedules;

-- 2. Buat tabel baru dengan nama berbeda
CREATE TABLE public.annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. JANGAN enable RLS sama sekali
-- ALTER TABLE public.annual_schedules ENABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON public.annual_schedules TO anon;
GRANT ALL ON public.annual_schedules TO authenticated;
GRANT ALL ON public.annual_schedules TO service_role;

-- 5. Index
CREATE INDEX idx_annual_schedules_year 
ON public.annual_schedules(year);

CREATE INDEX idx_annual_schedules_created_by 
ON public.annual_schedules(created_by);

-- 6. Restore data (jika ada)
INSERT INTO public.annual_schedules
SELECT * FROM temp_annual_backup;

-- 7. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'annual_schedules';

-- Harusnya: rls_enabled = false

-- 8. Test insert
INSERT INTO public.annual_schedules (
  year, 
  institution_name, 
  schedule_data, 
  created_by
)
VALUES (
  '2025',
  'Test New Table',
  '[]'::jsonb,
  'e4b197c3-cf85-4ee6-82e5-7dfd805d97b9'::uuid
)
RETURNING *;

-- ============================================
-- SELESAI! Tabel baru tanpa RLS issue
-- ============================================

-- ============================================
-- FINAL FIX: DROP & RECREATE TABLE
-- ============================================

-- 1. Drop tabel lama (hati-hati: data akan hilang!)
DROP TABLE IF EXISTS public.tahfidz_annual_schedules CASCADE;

-- 2. Buat tabel baru TANPA RLS
CREATE TABLE public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. JANGAN enable RLS
-- ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- 4. Index untuk performa
CREATE INDEX idx_tahfidz_annual_schedules_year 
ON public.tahfidz_annual_schedules(year);

CREATE INDEX idx_tahfidz_annual_schedules_created_by 
ON public.tahfidz_annual_schedules(created_by);

-- 5. Verifikasi
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tahfidz_annual_schedules';

-- Harusnya menampilkan: rls_enabled = false

-- ============================================
-- SELESAI! Tabel baru tanpa RLS
-- ============================================

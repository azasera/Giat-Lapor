-- ============================================
-- FIX SEMUA MASALAH SEKALIGUS
-- ============================================

-- MASALAH 1: Tabel annual schedules tidak bisa insert
-- ============================================

-- Drop tabel lama
DROP TABLE IF EXISTS public.tahfidz_annual_schedules CASCADE;

-- Buat tabel baru TANPA RLS
CREATE TABLE public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index
CREATE INDEX idx_tahfidz_annual_schedules_year 
ON public.tahfidz_annual_schedules(year);

CREATE INDEX idx_tahfidz_annual_schedules_created_by 
ON public.tahfidz_annual_schedules(created_by);

-- MASALAH 2: Guru tidak muncul di app
-- ============================================

-- Disable RLS di tabel teachers
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek status RLS kedua tabel
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tahfidz_annual_schedules', 'teachers')
ORDER BY tablename;

-- Harusnya kedua tabel menampilkan: rls_enabled = false

-- ============================================
-- SELESAI!
-- 1. Guru akan muncul di app
-- 2. Jadwal tahunan bisa disimpan
-- ============================================

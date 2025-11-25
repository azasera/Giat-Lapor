-- ============================================
-- BUAT TABEL JADWAL TAHUNAN TAHFIDZ
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- 1. Buat tabel
CREATE TABLE IF NOT EXISTS public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- 3. Policies untuk SELECT (semua authenticated user bisa lihat)
CREATE POLICY "All authenticated can view annual schedules"
ON public.tahfidz_annual_schedules FOR SELECT
USING (auth.role() = 'authenticated');

-- 4. Policy untuk INSERT (semua authenticated user bisa insert)
CREATE POLICY "Authenticated users can insert annual schedules"
ON public.tahfidz_annual_schedules FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 5. Policy untuk UPDATE (hanya creator yang bisa update)
CREATE POLICY "Users can update their own annual schedules"
ON public.tahfidz_annual_schedules FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- 6. Policy untuk DELETE (hanya creator yang bisa delete)
CREATE POLICY "Users can delete their own annual schedules"
ON public.tahfidz_annual_schedules FOR DELETE
USING (created_by = auth.uid());

-- 7. Index untuk performa
CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_year 
ON public.tahfidz_annual_schedules(year);

CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_created_by 
ON public.tahfidz_annual_schedules(created_by);

-- ============================================
-- SELESAI! Tabel sudah siap digunakan
-- ============================================

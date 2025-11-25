-- ============================================
-- MINIMAL: Tabel Teachers (Paling Sederhana)
-- ============================================

-- Create table
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Policy paling sederhana: semua user authenticated bisa akses
CREATE POLICY "teachers_policy_all"
ON public.teachers
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_teachers_name ON public.teachers(name);

-- Test insert
INSERT INTO public.teachers (name) VALUES ('Test Guru') ON CONFLICT DO NOTHING;

-- Verifikasi
SELECT * FROM public.teachers;

-- ============================================
-- DONE!
-- ============================================

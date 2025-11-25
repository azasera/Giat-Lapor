-- ============================================
-- SIMPLE: Tabel Teachers (Tanpa Dependency)
-- ============================================

-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Simple policies (tanpa cek profiles)
CREATE POLICY "Anyone authenticated can view teachers"
ON public.teachers
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert teachers"
ON public.teachers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update teachers"
ON public.teachers
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete teachers"
ON public.teachers
FOR DELETE
USING (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_teachers_name ON public.teachers(name);

-- Trigger for updated_at (jika function sudah ada)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_teachers_updated_at
        BEFORE UPDATE ON public.teachers
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Verifikasi
SELECT 
    'SUCCESS! Table teachers created' as status,
    COUNT(*) as row_count
FROM public.teachers;

-- ============================================
-- DONE! Tabel teachers siap digunakan
-- ============================================

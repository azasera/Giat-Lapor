-- ============================================
-- TABEL TEACHERS: Daftar Guru untuk Supervisi
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

-- Policies
CREATE POLICY "Everyone can view teachers"
ON public.teachers
FOR SELECT
USING (true);

CREATE POLICY "Principal can insert teachers"
ON public.teachers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  )
);

CREATE POLICY "Admin can insert teachers"
ON public.teachers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Principal can update teachers"
ON public.teachers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  )
);

CREATE POLICY "Admin can update teachers"
ON public.teachers
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

CREATE POLICY "Principal can delete teachers"
ON public.teachers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  )
);

CREATE POLICY "Admin can delete teachers"
ON public.teachers
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX idx_teachers_name ON public.teachers(name);

-- ============================================
-- DONE! Tabel teachers siap digunakan
-- ============================================

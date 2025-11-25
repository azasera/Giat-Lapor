-- ============================================
-- JADWAL TAHUNAN SUPERVISI GURU TAHFIDZ
-- ============================================

-- Tabel untuk menyimpan jadwal tahunan (format tabel bulanan)
CREATE TABLE IF NOT EXISTS public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL, -- Array of {month: string, teachers: string[]}
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own annual schedules"
  ON public.tahfidz_annual_schedules FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Foundation can view all annual schedules"
  ON public.tahfidz_annual_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all annual schedules"
  ON public.tahfidz_annual_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Principal can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Admin can insert annual schedules"
  ON public.tahfidz_annual_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can update their own annual schedules"
  ON public.tahfidz_annual_schedules FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admin can update all annual schedules"
  ON public.tahfidz_annual_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own annual schedules"
  ON public.tahfidz_annual_schedules FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admin can delete all annual schedules"
  ON public.tahfidz_annual_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Trigger for updated_at
CREATE TRIGGER update_tahfidz_annual_schedules_updated_at
BEFORE UPDATE ON public.tahfidz_annual_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_year ON public.tahfidz_annual_schedules(year);
CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_created_by ON public.tahfidz_annual_schedules(created_by);

-- ============================================
-- CONTOH DATA
-- ============================================

-- Contoh insert jadwal tahunan
/*
INSERT INTO public.tahfidz_annual_schedules (year, institution_name, schedule_data, created_by)
VALUES (
  '2025',
  'Mahad Tahfidul Quran',
  '[
    {"month": "Januari", "teachers": ["Harziki, A.Md.T.", "Alim Aswari"]},
    {"month": "Februari", "teachers": ["Azali Abdul Ghani"]},
    {"month": "Maret", "teachers": ["Alim Aswari", "Muhammad Naufal Hudiya"]},
    {"month": "April", "teachers": ["Harziki, A.Md.T."]},
    {"month": "Mei", "teachers": []},
    {"month": "Juni", "teachers": ["Alim Aswari", "Azali Abdul Ghani"]},
    {"month": "Juli", "teachers": ["Harziki, A.Md.T."]},
    {"month": "Agustus", "teachers": []},
    {"month": "September", "teachers": ["Alim Aswari", "Azali Abdul Ghani", "Muhammad Naufal Hudiya", "Nayatullah, Lc."]},
    {"month": "Oktober", "teachers": ["Harziki, A.Md.T."]},
    {"month": "November", "teachers": []},
    {"month": "Desember", "teachers": ["Alim Aswari", "Azali Abdul Ghani", "Muhammad Naufal Hudiya", "Nayatullah, Lc."]}
  ]'::jsonb,
  'user-id-here'
);
*/

-- ============================================
-- CREATE: Tabel tahfidz_annual_schedules
-- ============================================

-- Create table
CREATE TABLE IF NOT EXISTS public.tahfidz_annual_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  institution_name text NOT NULL,
  schedule_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.tahfidz_annual_schedules ENABLE ROW LEVEL SECURITY;

-- SELECT Policies
CREATE POLICY "Users can view their own annual schedules"
ON public.tahfidz_annual_schedules
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "All authenticated can view annual schedules"
ON public.tahfidz_annual_schedules
FOR SELECT
USING (auth.role() = 'authenticated');

-- INSERT Policy
CREATE POLICY "Authenticated users can insert annual schedules"
ON public.tahfidz_annual_schedules
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE Policy
CREATE POLICY "Users can update their own annual schedules"
ON public.tahfidz_annual_schedules
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- DELETE Policy
CREATE POLICY "Users can delete their own annual schedules"
ON public.tahfidz_annual_schedules
FOR DELETE
USING (created_by = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_year ON public.tahfidz_annual_schedules(year);
CREATE INDEX IF NOT EXISTS idx_tahfidz_annual_schedules_created_by ON public.tahfidz_annual_schedules(created_by);

-- Verifikasi
SELECT 
  'SUCCESS! Table tahfidz_annual_schedules created' as status,
  COUNT(*) as row_count
FROM public.tahfidz_annual_schedules;

-- ============================================
-- DONE!
-- ============================================

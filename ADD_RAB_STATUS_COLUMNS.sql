-- Add missing columns to rab_data table for status tracking and review

-- Add status column
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'));

-- Add submitted_at column
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS submitted_at timestamp with time zone;

-- Add reviewed_at column
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;

-- Add review_comment column
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS review_comment text;

-- Create index for faster queries by status
CREATE INDEX IF NOT EXISTS idx_rab_data_status ON public.rab_data(status);

-- Create index for faster queries by user_id and status
CREATE INDEX IF NOT EXISTS idx_rab_data_user_status ON public.rab_data(user_id, status);

-- Update RLS policies to allow foundation to update RAB status
CREATE POLICY IF NOT EXISTS "Foundation can update rab_data status."
  ON public.rab_data FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'foundation'));

-- Update RLS policies to allow admin to do everything
CREATE POLICY IF NOT EXISTS "Admin can do everything on rab_data."
  ON public.rab_data FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY IF NOT EXISTS "Admin can do everything on expense_items."
  ON public.expense_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

COMMENT ON COLUMN public.rab_data.status IS 'Status of RAB: draft, submitted, approved, or rejected';
COMMENT ON COLUMN public.rab_data.submitted_at IS 'Timestamp when RAB was submitted to foundation';
COMMENT ON COLUMN public.rab_data.reviewed_at IS 'Timestamp when RAB was reviewed by foundation';
COMMENT ON COLUMN public.rab_data.review_comment IS 'Foundation review comment or feedback';

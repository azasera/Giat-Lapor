ALTER TABLE public.rab_data
ADD COLUMN status TEXT DEFAULT 'draft' NOT NULL;

-- Add submitted_at, reviewed_at, and review_comment columns
ALTER TABLE public.rab_data
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN review_comment TEXT;

-- Update existing rows to 'draft' if status is null (for data consistency)
UPDATE public.rab_data
SET status = 'draft'
WHERE status IS NULL;
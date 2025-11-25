-- Add missing status columns to rab_data table
ALTER TABLE public.rab_data
ADD COLUMN status text DEFAULT 'draft' NOT NULL,
ADD COLUMN submitted_at timestamp with time zone,
ADD COLUMN reviewed_at timestamp with time zone,
ADD COLUMN review_comment text;

-- Add index for better query performance
CREATE INDEX idx_rab_data_status ON public.rab_data(status);
CREATE INDEX idx_rab_data_user_status ON public.rab_data(user_id, status);

-- Update existing records to have 'draft' status if null
UPDATE public.rab_data SET status = 'draft' WHERE status IS NULL;
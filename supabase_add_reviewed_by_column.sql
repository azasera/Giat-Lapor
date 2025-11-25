-- ============================================
-- ADD reviewed_by COLUMN TO rab_data TABLE
-- ============================================
-- This column is needed for tracking who reviewed (approved/rejected) the RAB

-- Add reviewed_by column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rab_data' 
        AND column_name = 'reviewed_by'
    ) THEN
        ALTER TABLE public.rab_data 
        ADD COLUMN reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Column reviewed_by added to rab_data table';
    ELSE
        RAISE NOTICE 'Column reviewed_by already exists in rab_data table';
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_rab_data_reviewed_by ON public.rab_data(reviewed_by);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rab_data'
AND column_name = 'reviewed_by';

-- ============================================
-- DONE!
-- ============================================
-- Column reviewed_by has been added to rab_data table
-- This will allow tracking who approved or rejected each RAB

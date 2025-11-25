-- ============================================
-- QUICK FIX: RAB Reject Issue
-- ============================================
-- Copy-paste SQL ini ke Supabase SQL Editor dan klik Run
-- ============================================

-- Add reviewed_by column
ALTER TABLE public.rab_data 
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_rab_data_reviewed_by ON public.rab_data(reviewed_by);

-- Verify
SELECT 
    'SUCCESS! Column reviewed_by added to rab_data table' as status,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'rab_data'
AND column_name = 'reviewed_by';

-- ============================================
-- DONE! Refresh browser dan test reject RAB
-- ============================================

-- Enable Row Level Security for activities and achievements tables if not already enabled
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to manage activities for their own reports" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated users to manage achievements for their own reports" ON public.achievements;

-- Create RLS policy for activities table
CREATE POLICY "Allow authenticated users to manage activities for their own reports"
  ON public.activities FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reports WHERE id = activities.report_id AND user_id = auth.uid()));

-- Create RLS policy for achievements table
CREATE POLICY "Allow authenticated users to manage achievements for their own reports"
  ON public.achievements FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.reports WHERE id = achievements.report_id AND user_id = auth.uid()));

-- Optional: If you also need policies for 'select' (read) access, ensure they are in place.
-- The 'FOR ALL' policy above covers SELECT, INSERT, UPDATE, DELETE.
-- Enable Row Level Security for rab_data table
ALTER TABLE public.rab_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for rab_data to avoid conflicts
DROP POLICY IF EXISTS "Principals can manage their own RABs." ON public.rab_data;
DROP POLICY IF EXISTS "Foundation can view submitted/approved RABs." ON public.rab_data;
DROP POLICY IF EXISTS "Admins can manage all RABs." ON public.rab_data;

-- Policy for 'principal' role: Can manage their own RABs
CREATE POLICY "Principals can manage their own RABs."
  ON public.rab_data FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal' AND user_id = auth.uid()
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal' AND user_id = auth.uid()
  );

-- Policy for 'foundation' role: Can view submitted or approved RABs
CREATE POLICY "Foundation can view submitted/approved RABs."
  ON public.rab_data FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'foundation' AND status IN ('submitted', 'approved')
  );

-- Policy for 'admin' role: Can manage all RABs
CREATE POLICY "Admins can manage all RABs."
  ON public.rab_data FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Enable Row Level Security for expense_items table
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for expense_items to avoid conflicts
DROP POLICY IF EXISTS "Principals can manage their own expense items." ON public.expense_items;
DROP POLICY IF EXISTS "Foundation can view expense items of submitted/approved RABs." ON public.expense_items;
DROP POLICY IF EXISTS "Admins can manage all expense items." ON public.expense_items;

-- Policy for 'principal' role: Can manage expense items of their own RABs
CREATE POLICY "Principals can manage their own expense items."
  ON public.expense_items FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal' AND rab_id IN (SELECT id FROM public.rab_data WHERE user_id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'principal' AND rab_id IN (SELECT id FROM public.rab_data WHERE user_id = auth.uid())
  );

-- Policy for 'foundation' role: Can view expense items of submitted/approved RABs
CREATE POLICY "Foundation can view expense items of submitted/approved RABs."
  ON public.expense_items FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'foundation' AND rab_id IN (SELECT id FROM public.rab_data WHERE status IN ('submitted', 'approved'))
  );

-- Policy for 'admin' role: Can manage all expense items
CREATE POLICY "Admins can manage all expense items."
  ON public.expense_items FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
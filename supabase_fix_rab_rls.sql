-- Enable Row Level Security for the 'rab_data' table if not already enabled
ALTER TABLE public.rab_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict or need to be replaced
DROP POLICY IF EXISTS "Principals can manage their own RABs." ON public.rab_data;
DROP POLICY IF EXISTS "Foundation can view submitted/approved RABs." ON public.rab_data;
DROP POLICY IF EXISTS "Admins can manage all RABs." ON public.rab_data;

-- Policy for 'principal' role: Can SELECT, INSERT, UPDATE, DELETE their own RABs
CREATE POLICY "Principals can manage their own RABs."
  ON public.rab_data FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for 'foundation' role: Can SELECT submitted or approved RABs
CREATE POLICY "Foundation can view submitted/approved RABs."
  ON public.rab_data FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'foundation'
    AND status IN ('submitted', 'approved')
  );

-- Policy for 'foundation' role: Can UPDATE status, review_comment, and signature fields for submitted RABs
CREATE POLICY "Foundation can update submitted RABs."
  ON public.rab_data FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'foundation'
    AND status = 'submitted'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'foundation'
    AND status IN ('submitted', 'approved', 'rejected') -- Allow changing status to approved/rejected
    AND (
      -- Only allow updating specific fields for foundation
      NEW.status IS DISTINCT FROM OLD.status OR
      NEW.review_comment IS DISTINCT FROM OLD.review_comment OR
      NEW.signature_kabid_umum IS DISTINCT FROM OLD.signature_kabid_umum OR
      NEW.signature_bendahara_yayasan IS DISTINCT FROM OLD.signature_bendahara_yayasan OR
      NEW.signature_sekretaris_yayasan IS DISTINCT FROM OLD.signature_sekretaris_yayasan OR
      NEW.signature_ketua_yayasan IS DISTINCT FROM OLD.signature_ketua_yayasan OR
      NEW.signature_kepala_mta IS DISTINCT FROM OLD.signature_kepala_mta
    )
  );

-- Policy for 'admin' role: Can SELECT, INSERT, UPDATE, DELETE all RABs
CREATE POLICY "Admins can manage all RABs."
  ON public.rab_data FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
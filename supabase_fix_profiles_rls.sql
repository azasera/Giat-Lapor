-- Enable Row Level Security for the profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict or are no longer needed for insert
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile." ON public.profiles;

-- Create a new policy to allow authenticated users to insert their own profile
-- This policy ensures that a user can only create a profile for their own user_id (auth.uid())
CREATE POLICY "Allow authenticated users to insert their own profile."
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Optional: Add a policy to allow users to view their own profile
-- DROP POLICY IF EXISTS "Allow authenticated users to view their own profile." ON public.profiles;
-- CREATE POLICY "Allow authenticated users to view their own profile."
--   ON public.profiles FOR SELECT
--   TO authenticated
--   USING (auth.uid() = id);

-- Optional: Add a policy to allow users to update their own profile
-- DROP POLICY IF EXISTS "Allow authenticated users to update their own profile." ON public.profiles;
-- CREATE POLICY "Allow authenticated users to update their own profile."
--   ON public.profiles FOR UPDATE
--   TO authenticated
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);
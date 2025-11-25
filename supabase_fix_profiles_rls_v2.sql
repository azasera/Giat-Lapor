-- Ensure Row Level Security is enabled for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing RLS policies on the profiles table to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to create their own profile" ON public.profiles;
-- Add any other policy names you might have used previously if they exist

-- 1. Policy for INSERT: Allow authenticated users to create their own profile
CREATE POLICY "Authenticated users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Policy for SELECT: Allow authenticated users to view their own profile
CREATE POLICY "Authenticated users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Policy for UPDATE: Allow authenticated users to update their own profile
CREATE POLICY "Authenticated users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Optional: Policy for DELETE (if you want users to delete their own profile, usually not recommended)
-- CREATE POLICY "Authenticated users can delete their own profile"
--   ON public.profiles FOR DELETE
--   TO authenticated
--   USING (auth.uid() = id);
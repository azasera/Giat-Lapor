-- ============================================
-- MIGRATION: Add Documentation Photos Feature
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add column to tahfidz_supervisions table
ALTER TABLE public.tahfidz_supervisions
ADD COLUMN IF NOT EXISTS documentation_photos text[];

COMMENT ON COLUMN public.tahfidz_supervisions.documentation_photos IS 'Array of URLs to photos/videos stored in Supabase Storage as documentation proof of supervision';

-- Step 2: Create storage bucket (if not exists)
-- Note: This needs to be done manually in Supabase Dashboard > Storage
-- Bucket name: supervision-photos
-- Public: true
-- File size limit: 52428800 (50MB)
-- Allowed MIME types: image/*,video/*

-- Step 3: Add RLS policies for storage bucket
-- Only run this AFTER creating the bucket manually

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can upload supervision photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own supervision photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own supervision photos" ON storage.objects;

-- Create new policies
CREATE POLICY "Authenticated users can upload supervision photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'supervision-photos');

CREATE POLICY "Users can update their own supervision photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'supervision-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own supervision photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'supervision-photos' AND (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tahfidz_supervisions' 
AND column_name = 'documentation_photos';

-- Check if policies were created
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%supervision photos%';

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see the column and 3 policies, migration is complete!
-- Don't forget to create the storage bucket manually in Dashboard > Storage

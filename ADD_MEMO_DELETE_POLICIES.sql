-- SQL Migration: Add DELETE policies for public.memos and public.memo_tables
-- This allows principals to delete their own draft/final memos, and admin to delete any memo

-- 1. Memos table DELETE policies
DROP POLICY IF EXISTS "Users can delete their own memos" ON public.memos;
CREATE POLICY "Users can delete their own memos"
  ON public.memos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can delete all memos" ON public.memos;
CREATE POLICY "Admin can delete all memos"
  ON public.memos FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- 2. Memo_tables table DELETE policies
DROP POLICY IF EXISTS "Users can delete their own memo tables" ON public.memo_tables;
CREATE POLICY "Users can delete their own memo tables"
  ON public.memo_tables FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Admin can delete all memo tables" ON public.memo_tables;
CREATE POLICY "Admin can delete all memo tables"
  ON public.memo_tables FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

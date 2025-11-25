-- Script untuk memperbaiki RLS policies di tabel reports
-- Jalankan script ini di Supabase SQL Editor

-- Hapus semua policies yang mungkin bermasalah
DROP POLICY IF EXISTS "Users can update their own reports." ON public.reports;
DROP POLICY IF EXISTS "Users can delete their own reports." ON public.reports;

-- Buat policy update yang benar
CREATE POLICY "Users can update their own reports."
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Buat policy delete yang benar
CREATE POLICY "Users can delete their own reports."
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Pastikan RLS aktif
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Test deletion rights (optional - untuk debug)
-- SELECT id, user_id, principal_name, (auth.uid() = user_id) AS can_delete
-- FROM public.reports
-- WHERE id = 'REPORT_ID_TO_TEST';

-- Verifikasi policies yang ada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('reports', 'activities', 'achievements')
ORDER BY tablename, cmd;
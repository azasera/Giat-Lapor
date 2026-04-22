-- ============================================
-- FIX: Memo Tidak Muncul di Akun Yayasan
-- ============================================
-- Masalah: Foundation tidak memiliki izin (RLS Policy) untuk melihat memo yang dikirim
-- Jalankan script ini di Supabase SQL Editor

-- 1. Pastikan RLS aktif di tabel memos
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- 2. Kebijakan agar Foundation bisa melihat memo yang statusnya 'sent_to_foundation'
DROP POLICY IF EXISTS "Foundation can view sent memos" ON public.memos;
CREATE POLICY "Foundation can view sent memos"
ON public.memos FOR SELECT
TO authenticated
USING (
  status = 'sent_to_foundation'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'foundation'
  )
);

-- 3. Kebijakan agar Admin bisa melihat semua memo (jika belum ada)
DROP POLICY IF EXISTS "Admin can view all memos" ON public.memos;
CREATE POLICY "Admin can view all memos"
ON public.memos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 4. Kebijakan agar Principal bisa melihat memo miliknya sendiri
DROP POLICY IF EXISTS "Users can view their own memos" ON public.memos;
CREATE POLICY "Users can view their own memos"
ON public.memos FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. Perbaiki akses ke tabel memo_tables (tabel detail)
ALTER TABLE public.memo_tables ENABLE ROW LEVEL SECURITY;

-- Foundation bisa melihat tabel detail dari memo yang dikirim ke mereka
DROP POLICY IF EXISTS "Foundation can view memo tables" ON public.memo_tables;
CREATE POLICY "Foundation can view memo tables"
ON public.memo_tables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.status = 'sent_to_foundation'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'foundation'
    )
  )
);

-- Admin bisa melihat semua tabel detail
DROP POLICY IF EXISTS "Admin can view all memo tables" ON public.memo_tables;
CREATE POLICY "Admin can view all memo tables"
ON public.memo_tables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Principal bisa melihat tabel detail miliknya sendiri
DROP POLICY IF EXISTS "Users can view their own memo tables" ON public.memo_tables;
CREATE POLICY "Users can view their own memo tables"
ON public.memo_tables FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memos
    WHERE public.memos.id = public.memo_tables.memo_id
    AND public.memos.user_id = auth.uid()
  )
);

-- ============================================
-- VERIFIKASI
-- ============================================

-- Cek apakah ada memo dengan status 'sent_to_foundation'
SELECT COUNT(*) as memo_sent_count FROM public.memos WHERE status = 'sent_to_foundation';

-- Cek policies yang aktif
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('memos', 'memo_tables')
ORDER BY tablename, policyname;
